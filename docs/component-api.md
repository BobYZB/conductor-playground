# Component API

这份文档专门整理 `src/components/` 下主要组件的接口、输入输出和修改注意事项。

适合在以下场景先阅读：

- 想改组件 props
- 想知道组件依赖什么数据
- 想判断修改一个组件会影响哪些页面

---

## 1. `src/components/DocCard.astro`

组件类型：

- Astro 展示组件

输入：

- `title: string`
- `slug: string`
- `summary: string`
- `category: string`
- `tags: string[]`
- `updatedAt?: string`

输出：

- 一张可点击的文档卡片
- 链接到 `/docs/<slug>/`

依赖：

- `src/lib/format.ts`
- `src/lib/paths.ts`

常见改动：

- 卡片结构
- 卡片字段展示
- 标签展示方式

注意事项：

- 如果改了跳转路径拼接，仍应继续使用 `withBase()`

---

## 2. `src/components/DocFilters.tsx`

组件类型：

- React 客户端组件

输入：

- `docs: Array<{ title; slug; summary; category; tags; updatedAt }>`
- `categories: string[]`
- `tags: string[]`

输出：

- 搜索框、分类筛选、标签筛选
- 过滤后的文档列表
- URL 查询参数同步

依赖：

- `src/lib/format.ts`
- `src/lib/paths.ts`

内部状态：

- `query`
- `category`
- `tag`
- `deferredQuery`

常见改动：

- 新增筛选维度
- 修改搜索规则
- 修改 URL 参数同步规则
- 修改列表卡片样式

注意事项：

- 改字段结构时，`src/pages/library.astro` 传入的数据也要同步调整

---

## 3. `src/components/PdfViewer.tsx`

组件类型：

- React 客户端组件

输入：

- `pdfUrl: string`
- `docSlug: string`
- `title: string`

输出：

- PDF 阅读器头部
- 工具栏
- 提示消息
- `canvas` 渲染区域

依赖：

- `src/components/ProgressNotice.tsx`
- `src/lib/progress.ts`
- `src/lib/supabase.ts`
- `pdfjs-dist`

核心内部状态：

- `pdfDoc`
- `pageNumber`
- `pageInput`
- `scale`
- `totalPages`
- `user`
- `loading`
- `rendering`
- `notice`
- `error`

核心交互能力：

- PDF 动态加载
- 当前页渲染
- 上一页 / 下一页
- 跳页
- 缩放
- 键盘翻页
- 滚轮翻页
- 滑动翻页
- 阅读进度恢复
- 阅读进度保存

常见改动：

- 翻页逻辑
- 缩放逻辑
- 页码显示
- 阅读提示
- 同步频率
- 交互阈值

注意事项：

- 改同步逻辑时，要同时兼容未登录与未配置 Supabase 的情况
- 改 PDF 行为时，通常也要关注 `src/styles/global.css`

---

## 4. `src/components/ProgressNotice.tsx`

组件类型：

- React 展示组件

输入：

- `tone: 'info' | 'success' | 'warning' | 'error'`
- `children: string`

输出：

- 一条带语义状态的提示消息

依赖：

- `src/styles/global.css`

常见改动：

- 提示文案样式
- 提示等级扩展

---

## 5. `src/components/AuthButton.tsx`

组件类型：

- React 客户端组件

输入：

- 无外部 props

输出：

- 未登录状态下的“邮箱登录”入口
- 登录表单
- 已登录状态与退出按钮
- 登录相关提示消息

依赖：

- `src/lib/supabase.ts`

内部状态：

- `user`
- `email`
- `busy`
- `message`
- `showForm`

常见改动：

- 登录入口文案
- 表单展示逻辑
- 成功/失败提示
- 退出按钮逻辑

注意事项：

- 登录前保存返回地址依赖 `AUTH_RETURN_TO_KEY`
- 修改登录逻辑时也要检查 `AuthCallback.tsx`

---

## 6. `src/components/AuthCallback.tsx`

组件类型：

- React 客户端组件

输入：

- 无外部 props

输出：

- 登录处理中页面
- 登录失败提示
- 返回首页按钮

依赖：

- `src/lib/supabase.ts`
- `src/lib/paths.ts`

内部状态：

- `message`
- `failed`
- `pkceError`

常见改动：

- 回调页提示文案
- 失败提示
- 登录成功后的跳转体验

注意事项：

- 这里处理的是专用回调页
- 同时要留意 `AuthCodeHandler.tsx` 对其他页面带 `code` 的处理

---

## 7. `src/components/AuthCodeHandler.tsx`

组件类型：

- React 客户端组件

输入：

- 无外部 props

输出：

- 不渲染 UI
- 负责处理当前页面 URL 中的认证 code

依赖：

- `src/lib/supabase.ts`
- `src/lib/paths.ts`

常见改动：

- code 参数识别
- 登录完成后的跳转地址清洗
- 登录完成后的自动跳转逻辑

注意事项：

- 这是“全局兜底处理器”
- 不要和 `AuthCallback.tsx` 的逻辑互相打架

---

## 8. `src/components/SiteHeader.astro`

组件类型：

- Astro 结构组件

输入：

- 无外部 props

输出：

- 品牌区
- 主导航
- 登录区域

依赖：

- `src/components/AuthButton.tsx`
- `src/lib/paths.ts`

---

## 9. `src/components/SiteFooter.astro`

组件类型：

- Astro 展示组件

输入：

- 无外部 props

输出：

- 页脚说明文案

---

## 10. 组件修改建议

### 改 props 结构时

同时检查：

- 组件定义
- 所有调用方
- 文档中的接口描述

### 改组件行为时

同时检查：

- 调用该组件的页面
- 组件依赖的 `lib`
- 对应样式类

### 改共享组件时

优先查看：

- `docs/module-dependency-map.md`
- `docs/development-guide.md`
