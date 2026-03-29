# 开发文档

## 1. 使用方式

后续开发请优先按下面流程工作：

1. 先看本文件，确定需求属于哪个模块
2. 如果需求偏界面，继续看 `docs/ui-location-guide.md`
3. 如果需求偏执行步骤，继续看 `docs/common-tasks.md`
4. 根据“修改需求 -> 对应文件”表定位文件
5. 只打开对应模块文件修改
6. 修改后运行最小必要验证命令

目标是避免每次都重新扫描整个项目。

## 2. 目录结构

```text
docs/                     文档索引与开发说明
public/
  documents/              实际 PDF 文件目录
src/
  components/             React / Astro 组件
  content/docs/           文档元数据 Markdown
  layouts/                页面布局
  lib/                    纯函数、数据访问、路径与格式化工具
  pages/                  Astro 路由页面
  styles/                 全局样式
scripts/                  辅助脚本
supabase/                 数据库结构 SQL
```

## 3. 页面结构

### `src/pages/index.astro`

首页。

职责：

- 拉取全部公开文档
- 生成精选文档列表
- 展示站点定位与入口

需要改首页文案、统计卡片、首页推荐逻辑时，优先看这个文件。

### `src/pages/library.astro`

文档库页。

职责：

- 拉取全部公开文档
- 将数据转成前端筛选组件需要的结构
- 将分类和标签传入筛选组件

如果要改文档库入口结构或传给筛选器的数据形状，看这个文件。

### `src/pages/docs/[slug].astro`

PDF 详情页。

职责：

- 基于 `slug` 生成静态路由
- 渲染文档标题、摘要、标签、元信息
- 挂载 PDF 阅读器
- 组织“紧凑头部 + 阅读器优先 + 文档说明”的阅读页结构

如果要改详情页布局、阅读器挂载方式或阅读页专用容器类，看这个文件。

### `src/pages/auth/callback.astro`

登录回调页。

职责：

- 承载登录完成后的状态页
- 挂载客户端回调组件

如果改登录回调页面结构，看这里。

## 4. 布局与全局样式

### `src/layouts/BaseLayout.astro`

全站基础布局。

职责：

- HTML 骨架
- 头部与底部
- 全局样式引入
- 全局登录码处理器挂载

如果需求是“全站都要变”，先看这里。

### `src/styles/global.css`

全站样式总文件。

职责：

- 颜色、圆角、阴影等设计变量
- 首页、文档库、详情页、阅读器、登录组件样式
- 响应式布局

如果是 UI、排版、按钮、布局、阅读器视觉问题，先看这个文件。

## 5. 组件职责

### `src/components/SiteHeader.astro`

站点头部。

- 品牌名
- 主导航
- 登录入口组件

### `src/components/SiteFooter.astro`

站点底部文案。

### `src/components/DocCard.astro`

首页卡片组件。

- 展示标题、摘要、分类、标签、更新时间
- 链接到详情页

### `src/components/DocFilters.tsx`

文档库筛选器。

职责：

- 管理搜索词、分类、标签状态
- 将筛选状态同步到 URL Query
- 在客户端过滤文档列表并渲染结果

如果要加筛选条件、排序、搜索策略、URL 参数联动，看这个组件。

### `src/components/PdfViewer.tsx`

PDF 阅读器核心组件，是当前最复杂的前端模块。

职责分解：

- 动态加载 `pdfjs-dist`
- 通过 Range Requests 按需加载 PDF 文档（不再一次性下载整个文件）
- 显示加载进度条
- 渲染当前页到 `canvas`
- 使用 `ImageBitmap` 缓存已渲染页面（最多 20 页）
- 使用 `OffscreenCanvas` 后台预渲染相邻页面
- 维护页码、缩放、输入框状态
- 恢复用户阅读进度
- 定时保存阅读进度
- 处理键盘、滚轮、滑动翻页
- 展示通知和错误信息

性能关键配置：

- `disableAutoFetch: true`：禁止后台自动拉取整个 PDF
- `disableStream: true`：禁止流式下载，仅按需拉取当前页数据
- `rangeChunkSize: 128 * 1024`：每次 Range 请求最大 128KB
- `PAGE_PREFETCH_RADIUS = 2`：预渲染前后各 2 页

常见改动入口：

- 改翻页逻辑：看页码状态与交互处理函数
- 改缩放逻辑：看 `scale` 相关状态和按钮
- 改阅读体验：看 `canvas-stage` 和渲染 effect
- 改同步行为：看与 `getReadingProgress` / `upsertReadingProgress` 的调用
- 改加载性能：看 `loadDocument` 中的 `getDocument` 参数和 `onProgress`
- 改缓存策略：看 `pageCacheRef`、`prefetchPages`、`MAX_CACHE_SIZE`
- 改预渲染范围：看 `PAGE_PREFETCH_RADIUS`

### `src/components/AuthButton.tsx`

头部登录组件。

职责：

- 显示当前登录状态
- 发起邮箱魔法链接登录
- 保存登录前返回地址
- 退出登录

如果改登录入口交互、表单、按钮状态，看这个文件。

### `src/components/AuthCallback.tsx`

专用回调页的客户端逻辑。

职责：

- 等待 Supabase 完成 PKCE 交换
- 登录成功后跳回之前页面
- 处理超时与 PKCE 失败提示

### `src/components/AuthCodeHandler.tsx`

全局登录码处理器。

职责：

- 处理“用户不在专用回调页也带着 code 参数回来”的情况
- 自动清理 URL 中的认证参数

如果是“登录后回到当前页”的问题，除了 `AuthCallback.tsx`，也要看这个文件。

### `src/components/ProgressNotice.tsx`

阅读器消息提示组件。

只负责展示，不负责业务逻辑。

## 6. 工具层与数据层

### `src/lib/docs.ts`

文档集合的查询与派生工具。

职责：

- 获取公开文档
- 按更新时间排序
- 生成精选列表
- 汇总分类与标签

如果想改排序规则、精选规则、分类标签生成方式，看这里。

### `src/lib/format.ts`

日期格式化工具。

### `src/lib/paths.ts`

统一处理带 `base path` 的站内路径。

只要是站内链接，优先走 `withBase()`，不要手写路径。

### `src/lib/progress.ts`

阅读进度的数据访问层。

职责：

- 读取当前用户某文档的阅读进度
- 写入当前用户某文档的最新页码

如果需求涉及阅读历史、最近阅读、书签、批注，优先从这里扩展。

### `src/lib/supabase.ts`

Supabase 浏览器客户端与认证辅助工具。

职责：

- 创建浏览器端 Supabase Client
- 判断环境变量是否已配置
- 获取当前用户
- 发起邮箱登录
- 退出登录
- 订阅登录状态变化
- 等待认证回调完成
- 计算认证回调 URL 和默认登录后跳转地址

只要是认证流程、回调地址、Session 问题，先看这里。

## 7. 内容系统

### `src/content.config.ts`

定义文档集合 `docs` 的 Schema。

当前要求：

- 只重点支持 `pdf`
- 每份文档必须有标题、slug、摘要、分类、标签、日期
- `pdfPath` 指向 `public/documents/...`

如果要新增字段，例如作者、来源、封面、权限等级、语言，先改这里。

### `src/content/docs/*.md`

每个 Markdown 文件代表一份文档条目。

包含两部分：

- Frontmatter：用于列表、详情页、路由、筛选
- 正文：用于详情页右侧/下方的文档说明

如果需求是新增文档、修正文档元数据、补阅读说明，直接改这里。

## 8. 脚本与数据库

### `scripts/new-doc.mjs`

新增文档脚本。

职责：

- 询问 slug、标题、分类、标签
- 自动创建 Markdown 条目
- 自动创建 `public/documents/<slug>/` 目录

如果新增文档模板字段，要同步修改这个脚本。

### `scripts/validate-docs.mjs`

文档校验脚本。

职责：

- 检查 Markdown Frontmatter 是否完整
- 检查 `slug` 是否重复
- 检查 PDF 文件是否存在
- 检查日期是否合法

如果调整内容模型字段，也要同步改这个脚本。

### `supabase/schema.sql`

阅读进度表结构与 RLS 策略。

当前只存：

- 用户 ID
- 文档 slug
- 最后阅读页
- 更新时间

如果要新增字段或改权限策略，看这个文件。

## 9. 核心业务流程

### 文档展示流程

1. 内容来源于 `src/content/docs/*.md`
2. `src/lib/docs.ts` 读取并排序
3. 首页与文档库页渲染列表
4. 详情页按 `slug` 渲染单篇文档

### PDF 阅读流程

1. 详情页把 `pdfUrl`、`docSlug`、`title` 传入 `PdfViewer`
2. `PdfViewer` 动态加载 `pdfjs-dist`
3. 使用 Range Requests 按需请求 PDF 数据（不下载整个文件），同时显示加载进度条
4. 获得 PDF 文档对象后，根据当前页码渲染 `canvas`
5. 渲染完成后将页面缓存为 `ImageBitmap`，并在后台预渲染相邻页
6. 用户翻页时优先使用缓存，缓存未命中则按需拉取并渲染
7. 用户缩放时清空缓存，重新渲染当前页
8. 已登录时自动读取/写入阅读进度

### 登录流程

1. 用户在头部输入邮箱
2. `AuthButton.tsx` 调 `signInWithMagicLink`
3. Supabase 邮件把用户带回站点
4. `AuthCallback.tsx` 或 `AuthCodeHandler.tsx` 等待 Session 建立
5. 登录后回到之前页面

## 10. 修改需求 -> 对应文件

### 首页相关

- 改首页文案：`src/pages/index.astro`
- 改首页卡片结构：`src/components/DocCard.astro`
- 改首页推荐规则：`src/lib/docs.ts`

### 文档库相关

- 改筛选 UI：`src/components/DocFilters.tsx`
- 改筛选条件：`src/components/DocFilters.tsx`
- 改筛选数据来源：`src/pages/library.astro`、`src/lib/docs.ts`

### 详情页与阅读器相关

- 改详情页布局：`src/pages/docs/[slug].astro`
- 改阅读器按钮：`src/components/PdfViewer.tsx`
- 改键盘/滚轮/滑动翻页：`src/components/PdfViewer.tsx`
- 改阅读器样式：`src/styles/global.css`
- 改阅读提示消息：`src/components/ProgressNotice.tsx`
- 改加载性能参数：`src/components/PdfViewer.tsx`（`disableAutoFetch`、`rangeChunkSize` 等）
- 改页面缓存策略：`src/components/PdfViewer.tsx`（`MAX_CACHE_SIZE`、`PAGE_PREFETCH_RADIUS`）
- 改加载进度条样式：`src/styles/global.css`（`.reader-progress-bar`）

### 登录与同步相关

- 改头部登录入口：`src/components/AuthButton.tsx`
- 改回调页表现：`src/components/AuthCallback.tsx`
- 改 code 自动处理：`src/components/AuthCodeHandler.tsx`
- 改 Supabase client / 回调地址：`src/lib/supabase.ts`
- 改进度读写：`src/lib/progress.ts`
- 改数据库表结构：`supabase/schema.sql`

### 内容模型相关

- 改 Frontmatter 字段：`src/content.config.ts`
- 改新建文档模板：`scripts/new-doc.mjs`
- 改校验规则：`scripts/validate-docs.mjs`

### 全站样式与布局相关

- 改头部/底部骨架：`src/layouts/BaseLayout.astro`
- 改全站视觉：`src/styles/global.css`

### 部署与路径相关

- 改站点 base path：`astro.config.mjs`
- 改站内链接规则：`src/lib/paths.ts`

## 11. 新功能开发建议

### 新增一个页面

优先看：

- `src/pages/`
- `src/layouts/BaseLayout.astro`
- `src/lib/paths.ts`

### 新增一种内容字段

优先看：

- `src/content.config.ts`
- `src/content/docs/*.md`
- `scripts/new-doc.mjs`
- `scripts/validate-docs.mjs`
- 使用该字段的页面或组件

### 新增阅读器能力

优先看：

- `src/components/PdfViewer.tsx`
- `src/styles/global.css`
- `src/lib/progress.ts`
- `supabase/schema.sql`

### 新增登录后能力

优先看：

- `src/components/AuthButton.tsx`
- `src/components/AuthCallback.tsx`
- `src/components/AuthCodeHandler.tsx`
- `src/lib/supabase.ts`

## 12. 开发约定

- 站内路径统一使用 `withBase()`
- 内容字段变更要同步更新脚本和校验
- 涉及阅读器行为修改时，优先做局部验证
- 涉及登录/进度同步时，同时检查未配置 Supabase 的降级路径
- 能通过文档定位文件时，不要重新全量扫代码

## 13. 推荐的后续维护方式

后续每新增一个模块，建议同时更新本文件中的两部分：

1. “组件职责”或“工具层与数据层”
2. “修改需求 -> 对应文件”

这样以后修改时，先查文档就能直接定位到目标文件。
