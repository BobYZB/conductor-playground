import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import ProgressNotice from './ProgressNotice';
import { getReadingProgress, upsertReadingProgress } from '../lib/progress';
import { getCurrentUser, isSupabaseConfigured, onAuthStateChange } from '../lib/supabase';

interface PdfViewerProps {
  pdfUrl: string;
  docSlug: string;
  title: string;
}

interface NoticeState {
  tone: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

interface PDFPageLike {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    transform?: number[];
  }) => { promise: Promise<void>; cancel: () => void };
}

interface PDFDocumentLike {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageLike>;
  destroy: () => Promise<void> | void;
}

interface PDFLoadingTaskLike {
  promise: Promise<PDFDocumentLike>;
  onProgress: ((data: { loaded: number; total: number }) => void) | null;
  destroy: () => void;
}

type ScrollSnapMode = 'top' | 'bottom';

const WHEEL_NAVIGATION_THRESHOLD = 90;
const TOUCH_NAVIGATION_THRESHOLD = 72;

/** Number of neighbouring pages to pre-fetch in the background. */
const PAGE_PREFETCH_RADIUS = 2;

function clampPage(page: number, totalPages: number) {
  if (totalPages < 1) {
    return 1;
  }

  return Math.min(Math.max(page, 1), totalPages);
}

export default function PdfViewer({ pdfUrl, docSlug, title }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const persistTimerRef = useRef<number | null>(null);
  const wheelResetTimerRef = useRef<number | null>(null);
  const lastSavedPageRef = useRef<number | null>(null);
  const wheelDeltaRef = useRef(0);
  const pendingScrollSnapRef = useRef<ScrollSnapMode | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pdfRuntimeRef = useRef<{
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (src: string | Record<string, unknown>) => PDFLoadingTaskLike;
  } | null>(null);
  const pageCacheRef = useRef<Map<string, ImageBitmap>>(new Map());
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentLike | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [stageWidth, setStageWidth] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    if (configured) {
      getCurrentUser()
        .then((nextUser) => {
          if (active) {
            setUser(nextUser);
          }
        })
        .catch(() => {
          if (active) {
            setNotice({ tone: 'warning', text: '暂时无法读取登录状态，阅读器仍可继续使用。' });
          }
        });
    } else {
      setNotice({ tone: 'info', text: '当前未配置同步服务，登录与跨设备续读暂不可用。' });
    }

    const unsubscribe = onAuthStateChange((nextUser) => {
      if (active) {
        setUser(nextUser);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    let active = true;
    let loadingTask: PDFLoadingTaskLike | null = null;

    async function loadDocument() {
      try {
        setLoading(true);
        setLoadProgress(0);
        setError(null);
        const [pdfRuntime, workerModule] = await Promise.all([
          import('pdfjs-dist/build/pdf.mjs'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ]);

        if (!active) {
          return;
        }

        pdfRuntimeRef.current = {
          GlobalWorkerOptions: pdfRuntime.GlobalWorkerOptions,
          getDocument: pdfRuntime.getDocument as (src: string | Record<string, unknown>) => PDFLoadingTaskLike,
        };
        pdfRuntimeRef.current.GlobalWorkerOptions.workerSrc = workerModule.default;

        const runtime = pdfRuntimeRef.current;

        loadingTask = runtime.getDocument({
          url: pdfUrl,
          disableAutoFetch: true,
          disableStream: true,
          rangeChunkSize: 128 * 1024,
        });

        loadingTask.onProgress = (data: { loaded: number; total: number }) => {
          if (active && data.total > 0) {
            setLoadProgress(Math.min(Math.round((data.loaded / data.total) * 100), 100));
          }
        };

        const nextPdf = await loadingTask.promise;

        if (!active) {
          await nextPdf.destroy();
          return;
        }

        setPdfDoc(nextPdf);
        setTotalPages(nextPdf.numPages);
        setPageNumber(1);
        setPageInput('1');
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'PDF 加载失败。');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDocument();

    return () => {
      active = false;
      loadingTask?.destroy();
    };
  }, [pdfUrl]);

  useEffect(() => {
    let active = true;

    async function restoreProgress() {
      if (!pdfDoc || !user) {
        if (!user && configured) {
          setNotice({ tone: 'info', text: '登录后可自动同步并恢复阅读进度。' });
        }
        return;
      }

      try {
        const progress = await getReadingProgress(docSlug);

        if (!active || !progress) {
          return;
        }

        const nextPage = clampPage(progress.lastPage, pdfDoc.numPages);
        setPageNumber(nextPage);
        setPageInput(String(nextPage));
        setNotice({ tone: 'success', text: `已恢复到上次阅读位置：第 ${nextPage} 页。` });
        lastSavedPageRef.current = nextPage;
      } catch {
        if (active) {
          setNotice({ tone: 'warning', text: '未能恢复上次阅读位置，你仍可从当前页继续阅读。' });
        }
      }
    }

    void restoreProgress();

    return () => {
      active = false;
    };
  }, [configured, docSlug, pdfDoc, user]);

  useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const updateStageWidth = () => {
      const style = window.getComputedStyle(stage);
      const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
      setStageWidth(Math.max(stage.clientWidth - horizontalPadding, 0));
    };

    updateStageWidth();

    const observer = new ResizeObserver(() => {
      updateStageWidth();
    });

    observer.observe(stage);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !stageWidth) {
      return;
    }

    let cancelled = false;
    let renderTask: { promise: Promise<void>; cancel: () => void } | null = null;

    async function renderPage() {
      setRendering(true);

      try {
        const currentDoc = pdfDoc;

        if (!currentDoc) {
          return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const page = await currentDoc.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const renderScale = (stageWidth / baseViewport.width) * zoomLevel;
        const cacheKey = `${pageNumber}@${renderScale}@${window.devicePixelRatio}`;
        const cachedBitmap = pageCacheRef.current.get(cacheKey);

        if (cachedBitmap) {
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('无法获取 PDF 画布上下文。');
          }

          canvas.width = cachedBitmap.width;
          canvas.height = cachedBitmap.height;

          const outputScale = window.devicePixelRatio || 1;
          canvas.style.width = `${cachedBitmap.width / outputScale}px`;
          canvas.style.height = `${cachedBitmap.height / outputScale}px`;

          context.drawImage(cachedBitmap, 0, 0);
        } else {
          const viewport = page.getViewport({ scale: renderScale });

          if (cancelled || !canvasRef.current) {
            return;
          }

          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('无法获取 PDF 画布上下文。');
          }

          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          renderTask = page.render({
            canvasContext: context,
            viewport,
            transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
          });

          await renderTask.promise;

          if (!cancelled) {
            try {
              const bitmap = await createImageBitmap(canvas);
              pageCacheRef.current.set(cacheKey, bitmap);

              const MAX_CACHE_SIZE = 20;

              if (pageCacheRef.current.size > MAX_CACHE_SIZE) {
                const firstKey = pageCacheRef.current.keys().next().value;

                if (firstKey !== undefined) {
                  const old = pageCacheRef.current.get(firstKey);
                  old?.close();
                  pageCacheRef.current.delete(firstKey);
                }
              }
            } catch {
              // ImageBitmap creation can fail in some environments; non-critical.
            }
          }
        }

        if (!cancelled) {
          const scrollSnapMode = pendingScrollSnapRef.current;

          if (scrollSnapMode) {
            window.requestAnimationFrame(() => {
              const stage = stageRef.current;

              if (!stage) {
                return;
              }

              stage.scrollTop = scrollSnapMode === 'bottom' ? stage.scrollHeight : 0;
              pendingScrollSnapRef.current = null;
            });
          }
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : 'PDF 渲染失败。');
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pageNumber, pdfDoc, stageWidth, zoomLevel]);

  // Background prefetch of neighbouring pages so they render instantly on navigation.
  const prefetchPages = useCallback(
    async (doc: PDFDocumentLike, center: number, currentScale: number) => {
      const outputScale = window.devicePixelRatio || 1;

      for (let offset = 1; offset <= PAGE_PREFETCH_RADIUS; offset++) {
        for (const p of [center + offset, center - offset]) {
          if (p < 1 || p > doc.numPages) {
            continue;
          }

          const key = `${p}@${currentScale}@${outputScale}`;

          if (pageCacheRef.current.has(key)) {
            continue;
          }

          try {
            const page = await doc.getPage(p);
            const viewport = page.getViewport({ scale: currentScale });
            const offscreen = new OffscreenCanvas(
              Math.floor(viewport.width * outputScale),
              Math.floor(viewport.height * outputScale),
            );
            const ctx = offscreen.getContext('2d');

            if (!ctx) {
              continue;
            }

            await page.render({
              canvasContext: ctx as unknown as CanvasRenderingContext2D,
              viewport,
              transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
            }).promise;

            const bitmap = await createImageBitmap(offscreen);
            pageCacheRef.current.set(key, bitmap);
          } catch {
            // Prefetch is best-effort; silently ignore failures.
          }
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!pdfDoc || rendering || !stageWidth) {
      return;
    }

    const timer = window.setTimeout(() => {
      void pdfDoc.getPage(pageNumber).then((page) => {
        const baseViewport = page.getViewport({ scale: 1 });
        const renderScale = (stageWidth / baseViewport.width) * zoomLevel;
        void prefetchPages(pdfDoc, pageNumber, renderScale);
      });
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pageNumber, pdfDoc, prefetchPages, rendering, stageWidth, zoomLevel]);

  // Clear page cache when viewport sizing changes to avoid stale bitmaps.
  useEffect(() => {
    const cache = pageCacheRef.current;
    cache.forEach((bitmap) => bitmap.close());
    cache.clear();
  }, [stageWidth, zoomLevel]);

  useEffect(() => {
    if (!user || !configured || !pdfDoc) {
      return;
    }

    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = window.setTimeout(() => {
      if (lastSavedPageRef.current === pageNumber) {
        return;
      }

      upsertReadingProgress(docSlug, pageNumber)
        .then(() => {
          lastSavedPageRef.current = pageNumber;
        })
        .catch(() => {
          setNotice({ tone: 'warning', text: '阅读进度暂未同步成功，本次阅读仍会继续显示。' });
        });
    }, 800);

    return () => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, [configured, docSlug, pageNumber, pdfDoc, user]);

  useEffect(() => {
    if (!user || !configured) {
      return;
    }

    const flushProgress = () => {
      if (lastSavedPageRef.current === pageNumber) {
        return;
      }

      void upsertReadingProgress(docSlug, pageNumber).then(() => {
        lastSavedPageRef.current = pageNumber;
      });
    };

    window.addEventListener('pagehide', flushProgress);

    return () => {
      window.removeEventListener('pagehide', flushProgress);
    };
  }, [configured, docSlug, pageNumber, user]);

  useEffect(() => {
    return () => {
      if (wheelResetTimerRef.current) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
    };
  }, []);

  const pageStatus = useMemo(() => {
    if (!totalPages) {
      return '0 / 0';
    }

    return `${pageNumber} / ${totalPages}`;
  }, [pageNumber, totalPages]);

  function changePage(nextPage: number, scrollSnapMode: ScrollSnapMode = 'top') {
    if (!totalPages) {
      return;
    }

    const clamped = clampPage(nextPage, totalPages);

    if (clamped === pageNumber) {
      return;
    }

    pendingScrollSnapRef.current = scrollSnapMode;
    setPageNumber(clamped);
  }

  function submitPageInput() {
    const nextValue = Number.parseInt(pageInput, 10);

    if (Number.isNaN(nextValue)) {
      setPageInput(String(pageNumber));
      return;
    }

    changePage(nextValue);
  }

  function scheduleWheelNavigationReset() {
    if (wheelResetTimerRef.current) {
      window.clearTimeout(wheelResetTimerRef.current);
    }

    wheelResetTimerRef.current = window.setTimeout(() => {
      wheelDeltaRef.current = 0;
    }, 160);
  }

  function handleStageWheel(event: ReactWheelEvent<HTMLDivElement>) {
    const stage = stageRef.current;

    if (!stage || !totalPages || rendering) {
      return;
    }

    stage.focus();

    const isAtTop = stage.scrollTop <= 2;
    const isAtBottom = stage.scrollTop + stage.clientHeight >= stage.scrollHeight - 2;
    const movingForward = event.deltaY > 0 && isAtBottom && pageNumber < totalPages;
    const movingBackward = event.deltaY < 0 && isAtTop && pageNumber > 1;

    if (!movingForward && !movingBackward) {
      wheelDeltaRef.current = 0;
      scheduleWheelNavigationReset();
      return;
    }

    event.preventDefault();
    wheelDeltaRef.current += event.deltaY;
    scheduleWheelNavigationReset();

    if (Math.abs(wheelDeltaRef.current) < WHEEL_NAVIGATION_THRESHOLD) {
      return;
    }

    wheelDeltaRef.current = 0;
    changePage(pageNumber + (movingForward ? 1 : -1), movingForward ? 'top' : 'bottom');
  }

  function handleStageKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        changePage(pageNumber - 1, 'bottom');
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        changePage(pageNumber + 1, 'top');
        break;
      case 'Home':
        event.preventDefault();
        changePage(1, 'top');
        break;
      case 'End':
        event.preventDefault();
        changePage(totalPages, 'top');
        break;
      case ' ': {
        event.preventDefault();
        changePage(pageNumber + (event.shiftKey ? -1 : 1), event.shiftKey ? 'bottom' : 'top');
        break;
      }
      default:
        break;
    }
  }

  function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    event.currentTarget.focus();
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];

    touchStartRef.current = null;

    if (!start || !touch) {
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const horizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    const verticalSwipe = Math.abs(deltaY) > Math.abs(deltaX) * 1.2;

    if (horizontalSwipe && Math.abs(deltaX) >= TOUCH_NAVIGATION_THRESHOLD) {
      changePage(pageNumber + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 'top' : 'bottom');
      return;
    }

    if (verticalSwipe && Math.abs(deltaY) >= TOUCH_NAVIGATION_THRESHOLD) {
      changePage(pageNumber + (deltaY < 0 ? 1 : -1), deltaY < 0 ? 'top' : 'bottom');
    }
  }

  return (
    <div className="reader-shell">
      <div className="reader-shell__header">
        <div>
          <p className="section-kicker">站内阅读器</p>
          <h2>{title}</h2>
        </div>
        <span className="reader-status">{pageStatus}</span>
      </div>

      {notice ? <ProgressNotice tone={notice.tone}>{notice.text}</ProgressNotice> : null}
      {error ? <ProgressNotice tone="error">{error}</ProgressNotice> : null}

      <div className="reader-toolbar">
        <div className="reader-toolbar__group">
          <button className="button button--ghost" type="button" onClick={() => changePage(pageNumber - 1)} disabled={pageNumber <= 1}>
            上一页
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => changePage(pageNumber + 1)}
            disabled={!totalPages || pageNumber >= totalPages}
          >
            下一页
          </button>
        </div>

        <div className="reader-toolbar__group reader-toolbar__group--compact">
          <label className="page-jump">
            <span>跳转页码</span>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onBlur={submitPageInput}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitPageInput();
                }
              }}
            />
          </label>
          <button className="button button--ghost" type="button" onClick={() => setZoomLevel((current) => Math.max(0.7, current - 0.1))}>
            缩小
          </button>
          <button className="button button--ghost" type="button" onClick={() => setZoomLevel((current) => Math.min(2.4, current + 0.1))}>
            放大
          </button>
          <button className="button button--ghost" type="button" onClick={() => setZoomLevel(1)}>
            重置
          </button>
        </div>
      </div>

      <p className="reader-hint">支持方向键、PgUp/PgDn、空格键，以及滚轮到底或左右/上下滑动翻页。</p>

      <div
        ref={stageRef}
        className="canvas-stage"
        tabIndex={0}
        role="region"
        aria-label={`${title} 阅读画布`}
        onKeyDown={handleStageKeyDown}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onWheel={handleStageWheel}
      >
        {loading ? (
          <div className="reader-placeholder">
            <p>PDF 正在加载中...{loadProgress > 0 ? ` ${loadProgress}%` : ''}</p>
            {loadProgress > 0 ? (
              <div className="reader-progress-bar">
                <div className="reader-progress-bar__fill" style={{ width: `${loadProgress}%` }} />
              </div>
            ) : null}
          </div>
        ) : null}
        {!loading ? <canvas ref={canvasRef} className={rendering ? 'reader-canvas reader-canvas--loading' : 'reader-canvas'} /> : null}
      </div>
    </div>
  );
}
