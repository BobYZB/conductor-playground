# 界面定位指南

这份文档用于解决一个具体问题：

**看到页面上的某个区域后，应该去改哪个文件。**

适合在改 UI、交互、布局时先阅读。

---

## 1. 全站骨架

### 整个页面外壳

看：

- `src/layouts/BaseLayout.astro`
- `src/styles/global.css`

适用场景：

- 想改全站 `<head>` 信息
- 想改页面主容器宽度
- 想改头部、主体、底部的整体骨架

### 顶部导航区

看：

- `src/components/SiteHeader.astro`
- `src/components/AuthButton.tsx`
- `src/styles/global.css`

适用场景：

- 改站点标题
- 改导航菜单
- 改右上角登录入口

### 底部说明区

看：

- `src/components/SiteFooter.astro`
- `src/styles/global.css`

---

## 2. 首页定位

页面文件：

- `src/pages/index.astro`

### 首页顶部大横幅

看：

- `src/pages/index.astro`
- `src/styles/global.css`

包含内容：

- 主标题
- 副标题
- 两个主操作按钮
- 右侧统计卡片

### 首页精选文档卡片

看：

- `src/pages/index.astro`
- `src/components/DocCard.astro`
- `src/styles/global.css`

如果要改：

- 卡片结构
- 卡片文案
- 卡片标签展示
- 点击跳转行为

### 首页“阅读方式”说明区

看：

- `src/pages/index.astro`
- `src/styles/global.css`

---

## 3. 文档库定位

页面文件：

- `src/pages/library.astro`

### 文档库页标题区

看：

- `src/pages/library.astro`
- `src/styles/global.css`

### 搜索 / 分类 / 标签筛选区

看：

- `src/components/DocFilters.tsx`
- `src/styles/global.css`

如果要改：

- 搜索框 placeholder
- 分类下拉
- 标签下拉
- 筛选参数写入 URL 的方式

### 文档库结果列表

看：

- `src/components/DocFilters.tsx`
- `src/styles/global.css`

如果要改：

- 卡片排版
- 结果数量提示
- 空状态样式与文案

---

## 4. PDF 详情页定位

页面文件：

- `src/pages/docs/[slug].astro`

### 详情页头部信息区

看：

- `src/pages/docs/[slug].astro`
- `src/styles/global.css`

包含内容：

- 分类
- 标题
- 摘要
- 发布时间 / 更新时间
- 标签
- “打开原始 PDF”
- “返回文档库”

### 详情页左右布局

看：

- `src/pages/docs/[slug].astro`
- `src/styles/global.css`

如果要改：

- 阅读器在左还是右
- 双栏宽度比例
- 移动端堆叠顺序

### 文档说明正文区

看：

- `src/pages/docs/[slug].astro`
- `src/content/docs/*.md`
- `src/styles/global.css`

说明：

- 正文内容本身来自每篇文档的 Markdown 正文
- 正文容器样式由全局 CSS 控制

---

## 5. PDF 阅读器定位

核心文件：

- `src/components/PdfViewer.tsx`
- `src/styles/global.css`

### 阅读器标题与页码状态

看：

- `src/components/PdfViewer.tsx`

如果要改：

- “站内阅读器”标题
- 当前页 / 总页数显示

### 工具栏按钮

看：

- `src/components/PdfViewer.tsx`
- `src/styles/global.css`

包含：

- 上一页
- 下一页
- 跳页输入框
- 缩小
- 放大
- 重置

### PDF 画布区域

看：

- `src/components/PdfViewer.tsx`
- `src/styles/global.css`

如果要改：

- 画布容器高度
- 滚动区域
- 焦点样式
- 阴影与背景

### 阅读器翻页交互

看：

- `src/components/PdfViewer.tsx`

包含：

- 按钮翻页
- 键盘翻页
- 滚轮翻页
- 滑动翻页
- 翻页后滚动到顶部或底部

### 阅读器提示与错误信息

看：

- `src/components/PdfViewer.tsx`
- `src/components/ProgressNotice.tsx`
- `src/styles/global.css`

---

## 6. 登录界面定位

### 头部登录入口

看：

- `src/components/AuthButton.tsx`
- `src/styles/global.css`

包含：

- “邮箱登录”按钮
- 邮箱输入表单
- 已登录状态
- 退出按钮
- 提示消息

### 登录回调页

看：

- `src/pages/auth/callback.astro`
- `src/components/AuthCallback.tsx`
- `src/styles/global.css`

如果要改：

- 回调页文案
- 登录中 / 失败状态
- 重试按钮

---

## 7. 常见 UI 修改快速定位

### 想改全站颜色或圆角

先看：

- `src/styles/global.css`

### 想改按钮通用样式

先看：

- `src/styles/global.css`

关键词：

- `.button`
- `.button--primary`
- `.button--secondary`
- `.button--ghost`

### 想改页面最大宽度

先看：

- `src/styles/global.css`

关键词：

- `--content-width`
- `.page-content`

### 想改 PDF 阅读器布局

先看：

- `src/pages/docs/[slug].astro`
- `src/styles/global.css`

关键词：

- `.doc-layout`
- `.reader-panel`
- `.reader-shell`

### 想改 PDF 阅读器交互

先看：

- `src/components/PdfViewer.tsx`

关键词：

- `changePage`
- `handleStageWheel`
- `handleStageKeyDown`
- `handleTouchStart`
- `handleTouchEnd`

---

## 8. 推荐阅读顺序

如果需求偏 UI，建议按下面顺序找：

1. `docs/ui-location-guide.md`
2. `docs/development-guide.md`
3. 对应页面文件
4. 对应组件文件
5. `src/styles/global.css`
