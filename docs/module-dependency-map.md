# 模块依赖图

这份文档用于说明：

**页面、组件、工具层、内容系统、数据库之间是怎么连起来的。**

适合在修改逻辑前，先快速判断影响范围。

---

## 1. 总体结构

```text
Astro Pages
  -> Layout
  -> Components
  -> lib/*
  -> Astro Content / public documents
  -> Supabase (auth + reading_progress)
```

更具体一点：

```text
src/pages/*
  -> src/layouts/BaseLayout.astro
  -> src/components/*
  -> src/lib/*

src/components/PdfViewer.tsx
  -> src/lib/progress.ts
  -> src/lib/supabase.ts
  -> pdfjs-dist

src/lib/progress.ts
  -> src/lib/supabase.ts
  -> Supabase reading_progress table

src/pages/index.astro / library.astro
  -> src/lib/docs.ts
  -> src/content/docs/*.md
```

---

## 2. 页面层依赖

### `src/pages/index.astro`

依赖：

- `src/layouts/BaseLayout.astro`
- `src/components/DocCard.astro`
- `src/lib/docs.ts`
- `src/lib/paths.ts`

数据来源：

- `src/content/docs/*.md`

说明：

- 首页只展示文档列表和站点介绍，不直接接触 Supabase

### `src/pages/library.astro`

依赖：

- `src/layouts/BaseLayout.astro`
- `src/components/DocFilters.tsx`
- `src/lib/docs.ts`

数据来源：

- `src/content/docs/*.md`

说明：

- 文档库页本身只组装数据，筛选逻辑在 `DocFilters.tsx`

### `src/pages/docs/[slug].astro`

依赖：

- `src/layouts/BaseLayout.astro`
- `src/components/PdfViewer.tsx`
- `src/lib/format.ts`
- `src/lib/paths.ts`
- `astro:content`

数据来源：

- `src/content/docs/*.md`
- `public/documents/<slug>/...`

说明：

- 详情页是内容系统和阅读器的汇合点

### `src/pages/auth/callback.astro`

依赖：

- `src/layouts/BaseLayout.astro`
- `src/components/AuthCallback.tsx`

说明：

- 这是认证回调专页

---

## 3. 布局层依赖

### `src/layouts/BaseLayout.astro`

依赖：

- `src/components/SiteHeader.astro`
- `src/components/SiteFooter.astro`
- `src/components/AuthCodeHandler.tsx`
- `src/styles/global.css`

说明：

- 所有页面都经过这里
- 只要全站结构变了，通常会影响这个文件

---

## 4. 组件层依赖

### `src/components/SiteHeader.astro`

依赖：

- `src/components/AuthButton.tsx`
- `src/lib/paths.ts`

### `src/components/DocCard.astro`

依赖：

- `src/lib/format.ts`
- `src/lib/paths.ts`

### `src/components/DocFilters.tsx`

依赖：

- `src/lib/format.ts`
- `src/lib/paths.ts`

说明：

- 纯客户端筛选
- 不依赖 Supabase

### `src/components/PdfViewer.tsx`

依赖：

- `src/components/ProgressNotice.tsx`
- `src/lib/progress.ts`
- `src/lib/supabase.ts`
- `pdfjs-dist`

说明：

- 它是交互最复杂的核心组件
- 同时连接 PDF 渲染、登录状态和进度同步

### `src/components/AuthButton.tsx`

依赖：

- `src/lib/supabase.ts`

### `src/components/AuthCallback.tsx`

依赖：

- `src/lib/supabase.ts`
- `src/lib/paths.ts`

### `src/components/AuthCodeHandler.tsx`

依赖：

- `src/lib/supabase.ts`
- `src/lib/paths.ts`

### `src/components/ProgressNotice.tsx`

依赖：

- 无业务依赖

说明：

- 只负责提示 UI

---

## 5. 工具层依赖

### `src/lib/docs.ts`

依赖：

- `astro:content`

输出给：

- `src/pages/index.astro`
- `src/pages/library.astro`

### `src/lib/format.ts`

依赖：

- 浏览器 / Node 原生 `Intl.DateTimeFormat`

输出给：

- `src/components/DocCard.astro`
- `src/components/DocFilters.tsx`
- `src/pages/docs/[slug].astro`

### `src/lib/paths.ts`

依赖：

- `import.meta.env.BASE_URL`

输出给：

- 页面和组件中的站内路径拼接

### `src/lib/progress.ts`

依赖：

- `src/lib/supabase.ts`

输出给：

- `src/components/PdfViewer.tsx`

数据库依赖：

- `public.reading_progress`

### `src/lib/supabase.ts`

依赖：

- `@supabase/ssr`
- `@supabase/supabase-js`
- `src/lib/paths.ts`
- 浏览器环境变量

输出给：

- `src/components/AuthButton.tsx`
- `src/components/AuthCallback.tsx`
- `src/components/AuthCodeHandler.tsx`
- `src/components/PdfViewer.tsx`
- `src/lib/progress.ts`

---

## 6. 内容系统依赖

### `src/content.config.ts`

决定：

- `src/content/docs/*.md` 的字段结构
- 页面可安全读取哪些 Frontmatter 字段

影响：

- 页面
- 文档卡片
- 新建文档脚本
- 校验脚本

### `src/content/docs/*.md`

被以下模块使用：

- `src/lib/docs.ts`
- `src/pages/docs/[slug].astro`

### `public/documents/<slug>/...`

被以下模块使用：

- `src/pages/docs/[slug].astro`
- `src/components/PdfViewer.tsx`
- `scripts/validate-docs.mjs`

---

## 7. 认证与同步依赖

```text
AuthButton
  -> signInWithMagicLink
  -> email redirect
  -> AuthCallback / AuthCodeHandler
  -> waitForAuthCallback
  -> session ready
  -> PdfViewer restore/save progress
  -> progress.ts
  -> Supabase reading_progress
```

相关文件：

- `src/components/AuthButton.tsx`
- `src/components/AuthCallback.tsx`
- `src/components/AuthCodeHandler.tsx`
- `src/components/PdfViewer.tsx`
- `src/lib/supabase.ts`
- `src/lib/progress.ts`
- `supabase/schema.sql`

---

## 8. 阅读器依赖

```text
docs/[slug].astro
  -> PdfViewer
  -> pdfjs-dist load document (Range Requests, on-demand)
  -> render page to canvas (with ImageBitmap cache)
  -> prefetch neighbouring pages (OffscreenCanvas)
  -> show loading progress bar
  -> read/write progress
  -> ProgressNotice
```

相关文件：

- `src/pages/docs/[slug].astro`
- `src/components/PdfViewer.tsx`
- `src/components/ProgressNotice.tsx`
- `src/lib/progress.ts`
- `src/lib/supabase.ts`
- `src/styles/global.css`

---

## 9. 改动影响判断

### 如果改 `src/lib/supabase.ts`

通常会影响：

- 登录入口
- 登录回调
- 自动处理 code
- PDF 阅读器中的用户状态与进度同步

### 如果改 `src/lib/progress.ts`

通常会影响：

- 阅读器进度恢复
- 阅读器进度保存

### 如果改 `src/content.config.ts`

通常会影响：

- 所有文档内容文件
- 页面数据读取
- 新建文档脚本
- 校验脚本

### 如果改 `src/styles/global.css`

通常会影响：

- 多个页面和组件
- 需要注意是否引发全站 UI 连锁变化

### 如果改 `src/pages/docs/[slug].astro`

通常会影响：

- 详情页布局
- 阅读器与正文的相对位置
- 文档元信息展示方式

### 如果改 `src/components/PdfViewer.tsx`

通常会影响：

- PDF 加载（Range Requests 参数、进度条）
- PDF 渲染（页面缓存、预渲染）
- 翻页
- 缩放
- 阅读进度同步
- 阅读器提示消息

---

## 10. 推荐使用方式

当你准备修改某个模块时，建议顺序：

1. 先看本文件，判断改动会波及哪些层
2. 再看 `docs/development-guide.md`
3. 再看 `docs/common-tasks.md`
4. 最后只打开真正相关的代码文件
