# 技术栈说明

## 1. 项目定位

Farmerville 是一个公开 PDF 文档站，核心能力是：

- 浏览公开文档
- 站内阅读 PDF
- 登录后同步阅读进度
- 静态部署到 GitHub Pages

项目目前以“内容站 + 阅读器 + 登录同步”三部分组成。

## 2. 技术栈总览

### 前端与构建

- `Astro 6`：负责页面路由、静态生成、内容集合加载
- `React 19`：负责需要客户端交互的组件
- `TypeScript`：开启严格模式，约束组件和数据结构
- `Vite`：由 Astro 内置，负责本地开发与打包

### 内容管理

- `Astro Content Collections`：管理 `src/content/docs/*.md` 文档元数据
- `Markdown`：存储每份 PDF 的标题、摘要、分类、标签、路径等信息

### PDF 阅读

- `pdfjs-dist`：在浏览器中加载 PDF、逐页渲染到 `canvas`

### 登录与数据同步

- `Supabase`
  - 邮箱魔法链接登录
  - 浏览器端 Session 管理
  - 阅读进度存储
- `@supabase/ssr`
  - 提供 `createBrowserClient`
- `@supabase/supabase-js`
  - 提供认证与数据库访问能力

### 部署与运行

- `GitHub Pages`：静态站点部署目标
- `Node.js >= 22.12.0`：本地开发与脚本运行环境

### 样式方案

- 原生 `CSS`
- 全局样式文件：`src/styles/global.css`
- 没有引入 Tailwind、CSS Modules、UI 组件库

## 3. 技术选型原因

### 为什么用 Astro

- 内容站场景适合静态生成
- 路由简单，页面首屏轻
- 只有交互组件才加载客户端 JS，适合文档站

### 为什么用 React

- 文档筛选、登录状态、PDF 阅读器都需要浏览器交互
- 以小岛组件形式嵌入 Astro，复杂度较低

### 为什么用 pdf.js

- 浏览器内最常见的 PDF 渲染方案
- 支持分页渲染、缩放、worker 加载
- 适合做站内阅读体验

### 为什么用 Supabase

- 邮箱登录接入快
- 前端可直接调用认证与数据库 API
- 适合阅读进度这类轻量同步需求

## 4. 当前运行模型

### 页面渲染模型

- Astro 页面在构建时生成静态 HTML
- React 组件通过 `client:load` 在浏览器激活
- PDF 渲染、登录状态、筛选逻辑都只在客户端运行

### 数据模型

- 文档元数据来自 `src/content/docs/*.md`
- PDF 文件来自 `public/documents/<slug>/...`
- 阅读进度来自 Supabase 表 `public.reading_progress`

## 5. 关键依赖与职责

- `astro`：站点框架与路由
- `@astrojs/react`：让 Astro 页面挂载 React 组件
- `react` / `react-dom`：交互组件运行时
- `pdfjs-dist`：PDF 加载与渲染
- `gray-matter`：文档校验脚本解析 Markdown Frontmatter
- `@supabase/ssr`：浏览器端 Supabase Client
- `@supabase/supabase-js`：认证与数据库读写

## 6. 环境变量

- `PUBLIC_SUPABASE_URL`：Supabase 项目地址
- `PUBLIC_SUPABASE_ANON_KEY`：Supabase 匿名公钥
- `PUBLIC_AUTH_REDIRECT_URL`：可选，自定义登录回调地址
- `SITE_URL`：站点线上地址
- `SITE_BASE_PATH`：可选，自定义部署子路径

## 7. 常用命令

```bash
npm install
npm run dev
npm run build
npm run preview
npm run validate
npm run doc:new
```

## 8. 后续开发建议

后续新增功能时，建议先阅读：

1. `docs/overview.md`
2. `docs/tech-stack.md`
3. `docs/development-guide.md`
4. `docs/component-api.md`
5. `docs/lib-api.md`
6. `docs/content-model.md`
7. `docs/ui-location-guide.md`
8. `docs/ui-style-index.md`
9. `docs/common-tasks.md`
10. `docs/validation-and-release.md`
11. `docs/module-dependency-map.md`
12. `docs/changelog.md`

原则是先通过文档定位模块，再只打开相关文件，不再从头扫描整个仓库。
