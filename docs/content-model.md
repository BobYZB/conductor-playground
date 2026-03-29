# Content Model

这份文档专门说明项目里的内容结构、字段规范、文件目录约定，以及这些内容如何流入页面。

适合在以下场景先阅读：

- 想新增文档字段
- 想新增一篇 PDF 文档
- 想理解 Markdown、PDF 文件、脚本、页面之间的关系

---

## 1. 内容系统总览

项目当前的内容系统由三部分组成：

- `src/content.config.ts`：定义内容 schema
- `src/content/docs/*.md`：存储每篇文档的元数据和正文说明
- `public/documents/<slug>/...`：存储真实 PDF 文件

整体关系：

```text
src/content.config.ts
  -> 约束 src/content/docs/*.md 的字段

src/content/docs/*.md
  -> 提供列表页和详情页所需元数据
  -> 提供详情页正文说明

public/documents/<slug>/source.pdf
  -> 提供 PDF 阅读器实际加载的文件
```

---

## 2. Schema 定义位置

文件：

- `src/content.config.ts`

当前 `docs` collection 的核心字段包括：

- `title`
- `slug`
- `docType`
- `summary`
- `category`
- `tags`
- `pdfPath`
- `coverPath`
- `publishedAt`
- `updatedAt`
- `featured`
- `draft`

字段特点：

- 绝大多数页面依赖这些字段渲染
- 当前项目主要只使用 `docType: 'pdf'`

注意事项：

- 一旦新增或修改字段，通常还要同步改：
  - `scripts/new-doc.mjs`
  - `scripts/validate-docs.mjs`
  - 使用该字段的页面或组件

---

## 3. Markdown 文档结构

目录：

- `src/content/docs/`

每个文件代表一篇文档，例如：

- `src/content/docs/example-pdf.md`

结构分两部分：

### Frontmatter

用于：

- 首页列表
- 文档库筛选
- 详情页头部信息
- 路由生成
- PDF 文件路径定位

### 正文内容

用于：

- 详情页中的文档说明区

这部分适合写：

- 文档简介
- 来源说明
- 阅读建议
- 注意事项

---

## 4. 字段说明

### `title`

类型：

- `string`

用途：

- 首页卡片标题
- 文档库标题
- 详情页标题
- 阅读器标题

### `slug`

类型：

- `string`

用途：

- 详情页路由
- PDF 进度存储标识
- PDF 文件目录命名

约束：

- 必须与文件名一致

### `docType`

类型：

- `'pdf' | 'markdown' | 'external' | 'download'`

当前实际使用：

- `pdf`

说明：

- 虽然 schema 支持多个值，但当前站点逻辑基本围绕 PDF 构建

### `summary`

类型：

- `string`

用途：

- 首页摘要
- 文档库摘要
- 详情页摘要

### `category`

类型：

- `string`

用途：

- 列表页展示
- 文档库筛选
- 详情页分类展示

### `tags`

类型：

- `string[]`

用途：

- 标签展示
- 文档库筛选

### `pdfPath`

类型：

- `string`

示例：

- `/documents/example-pdf/source.pdf`

用途：

- 详情页加载 PDF

约束：

- 当前校验要求它必须以 `/documents/` 开头

### `coverPath`

类型：

- `string | undefined`

当前状态：

- schema 已支持
- 当前页面还没有重点使用

### `publishedAt`

类型：

- `string`

用途：

- 发布时间展示

### `updatedAt`

类型：

- `string | undefined`

用途：

- 更新时间展示
- 文档排序

### `featured`

类型：

- `boolean`

用途：

- 首页精选列表

### `draft`

类型：

- `boolean`

用途：

- 控制文档是否公开

---

## 5. PDF 文件目录规范

目录：

- `public/documents/<slug>/`

当前约定：

- PDF 主文件通常是 `source.pdf`

例如：

```text
public/documents/example-pdf/source.pdf
```

说明：

- `public/` 下的文件会作为静态资源直接提供
- `pdfPath` 最终就是指向这里的公开路径

建议：

- 每篇文档独立一个目录
- 目录名与 `slug` 保持一致

---

## 6. 内容如何进入页面

### 首页

路径：

- `src/pages/index.astro`

过程：

1. 调 `getPublishedDocs()`
2. 从内容集合拿到公开 PDF
3. 渲染卡片

### 文档库

路径：

- `src/pages/library.astro`
- `src/components/DocFilters.tsx`

过程：

1. 页面读取全部文档
2. 组装为筛选组件需要的数据
3. 在客户端做搜索和筛选

### 详情页

路径：

- `src/pages/docs/[slug].astro`

过程：

1. 根据 `slug` 生成静态路由
2. 读取文档 Frontmatter
3. 渲染正文说明
4. 把 `pdfPath` 传给 `PdfViewer`

---

## 7. 新增字段时要同步修改哪些地方

至少检查：

- `src/content.config.ts`
- `scripts/new-doc.mjs`
- `scripts/validate-docs.mjs`
- 对应页面和组件
- 相关文档

如果字段用于筛选，还要检查：

- `src/pages/library.astro`
- `src/components/DocFilters.tsx`
- `src/lib/docs.ts`

如果字段用于详情页展示，还要检查：

- `src/pages/docs/[slug].astro`

---

## 8. 新增一篇文档的推荐流程

推荐顺序：

1. 执行 `npm run doc:new`
2. 填写 `slug`、标题、分类、标签
3. 将 PDF 放到 `public/documents/<slug>/source.pdf`
4. 补正文说明
5. 执行 `npm run validate`
6. 执行 `npm run build`

---

## 9. 常见内容问题

### 为什么文档没有出现在站点里

优先检查：

- `draft` 是否为 `true`
- `docType` 是否为 `pdf`
- `pdfPath` 是否有效
- PDF 文件是否真实存在

### 为什么详情页打不开 PDF

优先检查：

- `pdfPath` 是否正确
- `public/documents/<slug>/source.pdf` 是否存在

### 为什么首页排序不对

优先检查：

- `updatedAt`
- `publishedAt`
- `src/lib/docs.ts`

---

## 10. 配套阅读建议

建议同时阅读：

- `docs/development-guide.md`
- `docs/common-tasks.md`
- `docs/lib-api.md`
- `docs/module-dependency-map.md`
