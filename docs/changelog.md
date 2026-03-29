# 变更记录

本文档用于记录项目内已经落地的重要功能、结构调整和维护性改动。

建议后续每次完成一个可感知功能后，都补一条记录，方便后面开发时先查历史再改代码。

---

## 2026-03-29

### PDF 阅读器加载性能优化

相关文件：

- `src/components/PdfViewer.tsx`
- `src/styles/global.css`

本次变更内容：

- 启用 pdfjs-dist 的 HTTP Range Requests 按需加载，不再一次性下载整个 PDF
  - `disableAutoFetch: true`：禁止后台自动拉取整个文件
  - `disableStream: true`：禁止流式下载，配合 Range Requests 仅拉取当前页数据
  - `rangeChunkSize: 128KB`：每次 Range 请求最大 128KB
- 新增页面渲染缓存机制
  - 使用 `ImageBitmap` 缓存已渲染页面，来回翻页时直接从缓存绘制
  - 缓存上限 20 页，超出时淘汰最早的缓存
  - 缩放时自动清空缓存重新渲染
- 新增相邻页后台预渲染
  - 当前页渲染完成后，使用 `OffscreenCanvas` 在后台预渲染前后各 2 页
  - 预渲染延迟 200ms 启动，避免干扰当前页渲染
  - 预渲染失败静默忽略，不影响正常阅读
- 新增加载进度条
  - 利用 `PDFDocumentLoadingTask.onProgress` 回调显示下载百分比
  - 在加载占位区域显示带动画的进度条
- 新增 `PDFLoadingTaskLike` 类型定义，支持 `onProgress` 和 `destroy`
- 组件 cleanup 中调用 `loadingTask.destroy()` 中止加载

性能预期：

- 47MB PDF 首页加载从 10s+ 降至 1s 以内（仅需下载约 200-500KB）
- 翻到已缓存页面时渲染延迟接近 0
- 翻到已预渲染的相邻页面时渲染延迟接近 0

影响范围：

- PDF 阅读器加载体验
- PDF 阅读器翻页流畅度
- 新增 CSS 类：`.reader-progress-bar`、`.reader-progress-bar__fill`

验证方式：

- 执行 `npm run build`
- 构建通过
- 打开大文件 PDF 详情页，确认首页在数秒内加载完成
- 翻页后回翻，确认页面秒切

---

### PDF 阅读器交互优化

相关文件：

- `src/components/PdfViewer.tsx`
- `src/pages/docs/[slug].astro`
- `src/styles/global.css`

本次变更内容：

- 将详情页中的 PDF 阅读区调整到左侧
- 保留“上一页 / 下一页 / 跳页 / 缩放 / 重置”工具栏
- 新增键盘翻页支持
  - `ArrowLeft` / `ArrowUp` / `PageUp`：上一页
  - `ArrowRight` / `ArrowDown` / `PageDown`：下一页
  - `Space`：下一页
  - `Shift + Space`：上一页
  - `Home`：跳到第一页
  - `End`：跳到最后一页
- 新增滚轮翻页支持
  - 在页底继续向下滚动时翻到下一页
  - 在页顶继续向上滚动时翻到上一页
- 新增滑动翻页支持
  - 支持左右滑动
  - 支持上下滑动
- 翻页后根据方向自动滚动到新页顶部或底部
- 为阅读画布增加聚焦态与更明确的交互提示
- 将阅读器设为左侧粘性布局，提升长文档阅读时的稳定性

影响范围：

- 详情页阅读体验
- PDF 阅读器交互逻辑
- 详情页双栏布局与响应式表现

验证方式：

- 执行 `npm run build`
- 构建通过

---

### 文档体系补充

相关文件：

- `docs/tech-stack.md`
- `docs/development-guide.md`
- `README.md`

本次变更内容：

- 新增技术栈说明文档，沉淀项目的框架、依赖、部署和环境变量信息
- 新增开发文档，沉淀目录结构、模块职责、业务流程和“修改需求 -> 对应文件”索引
- 在 README 中增加开发导航入口

目标：

- 后续开发先读文档再定位文件
- 降低每次修改前重新全量扫描代码的成本
- 让新功能开发和旧功能维护都能快速找到入口

验证方式：

- 执行 `npm run build`
- 构建通过

---

## 维护建议

- 新增功能后，优先补充本文件
- 如果变更影响模块职责，也同步更新 `docs/development-guide.md`
- 如果变更涉及框架、依赖、部署或运行方式，也同步更新 `docs/tech-stack.md`
