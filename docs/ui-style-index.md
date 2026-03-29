# UI Style Index

这份文档专门说明 `src/styles/global.css` 里主要样式块分别控制什么界面。

目标是让后续修改 UI 时，不需要从头通读整份 CSS。

---

## 1. 使用方式

当你准备改样式时，建议按下面顺序：

1. 先在本文件里找到界面区域
2. 再去 `src/styles/global.css` 搜对应 class
3. 如果涉及结构变化，再回到对应 `.astro` 或 `.tsx` 文件

---

## 2. 全局基础区

优先关注：

- `:root`
- `*`
- `html`
- `body`
- `a`
- `img`
- `button, input, select`

负责内容：

- 颜色变量
- 圆角变量
- 阴影变量
- 全站字体
- 页面背景
- 基础元素默认样式

如果要改：

- 主题色
- 全站背景
- 字体风格
- 基础圆角与阴影

---

## 3. 页面骨架

优先关注：

- `.page-shell`
- `.page-content`

负责内容：

- 页面主体容器
- 页面最大宽度
- 页面上下留白

如果要改：

- 页面内容宽度
- 页面整体边距

---

## 4. 头部与底部

优先关注：

- `.site-header`
- `.site-footer`
- `.site-header__inner`
- `.site-footer__inner`
- `.site-mark`
- `.site-mark__badge`
- `.site-mark__title`
- `.site-nav`

负责内容：

- 站点头部布局
- 品牌区样式
- 导航区样式
- 底部文字区样式

---

## 5. 通用按钮

优先关注：

- `.button`
- `.button--primary`
- `.button--secondary`
- `.button--ghost`

负责内容：

- 通用按钮布局
- 主按钮样式
- 次按钮样式
- 幽灵按钮样式
- hover / disabled 状态

如果要统一改按钮视觉，先看这组 class。

---

## 6. 首页区域

优先关注：

- `.hero`
- `.hero__copy`
- `.hero__lede`
- `.hero__actions`
- `.hero__panel`
- `.stat-card`
- `.stat-card__label`

负责内容：

- 首页顶部大横幅
- 首页主标题与副标题
- 首页按钮区
- 首页右侧统计卡片

---

## 7. 通用区块与卡片

优先关注：

- `.section-block`
- `.section-block--tight`
- `.section-block--muted`
- `.section-heading`
- `.section-link`
- `.feature-grid`
- `.feature-card`
- `.card-grid`
- `.doc-card`
- `.library-card`

负责内容：

- 页面区块间距
- 浅色强调区
- 标题区布局
- 首页卡片
- 文档库卡片

---

## 8. 文档卡片和标签

优先关注：

- `.doc-card__hero`
- `.doc-card__body`
- `.doc-card__eyebrow`
- `.doc-card__summary`
- `.doc-card__meta`
- `.tag-row`
- `.tag-chip`

负责内容：

- 首页文档卡片内部结构
- 文档标签展示
- 更新时间展示

---

## 9. 文档库筛选区

优先关注：

- `.library-shell`
- `.filter-panel`
- `.filter-field`
- `.library-summary`
- `.library-grid`
- `.library-card__cover`
- `.library-card__body`
- `.empty-state`

负责内容：

- 文档库筛选器布局
- 搜索框 / 下拉框
- 筛选结果网格
- 空状态

---

## 10. 详情页头部

优先关注：

- `.doc-hero`
- `.doc-hero__content`
- `.doc-hero__summary`
- `.doc-meta`

负责内容：

- PDF 详情页头部信息区
- 标题、摘要、元信息排版

---

## 11. 详情页正文与双栏布局

优先关注：

- `.doc-layout`
- `.doc-layout__content`
- `.reader-panel`
- `.rich-copy`

负责内容：

- 详情页双栏布局
- 阅读器区域与正文区域的相对位置
- 正文容器样式

如果要改“阅读器在左还是右”或双栏比例，先看这里。

---

## 12. PDF 阅读器样式

优先关注：

- `.reader-shell`
- `.reader-shell__header`
- `.reader-toolbar`
- `.reader-toolbar__group`
- `.reader-toolbar__group--compact`
- `.reader-status`
- `.reader-hint`
- `.page-jump`
- `.canvas-stage`
- `.reader-canvas`
- `.reader-canvas--loading`
- `.reader-placeholder`
- `.reader-progress-bar`
- `.reader-progress-bar__fill`
- `.progress-note`
- `.progress-note--info`
- `.progress-note--success`
- `.progress-note--warning`
- `.progress-note--error`

负责内容：

- 阅读器整体容器
- 工具栏布局
- 页码输入区
- PDF 画布容器
- 加载态与加载进度条
- 提示消息样式

---

## 13. 登录相关样式

优先关注：

- `.auth-widget`
- `.auth-widget--disabled`
- `.auth-widget__signed-in`
- `.auth-form`
- `.auth-widget__message`
- `.callback-panel`

负责内容：

- 头部登录入口
- 登录表单
- 已登录状态
- 登录回调页

---

## 14. 响应式区块

优先关注：

- `@media (max-width: 960px)`
- `@media (max-width: 640px)`

负责内容：

- 平板与手机布局切换
- 双栏变单栏
- 头部布局变化
- 阅读器与正文堆叠
- 小屏 padding 调整

---

## 15. 常见样式修改路径

### 想改全站主色

先看：

- `:root`

### 想改站点宽度

先看：

- `:root`
- `.page-content`

### 想改首页横幅

先看：

- `.hero`
- `.hero__copy`
- `.hero__panel`

### 想改文档库筛选器

先看：

- `.filter-panel`
- `.filter-field`
- `.library-grid`

### 想改 PDF 阅读器视觉

先看：

- `.reader-shell`
- `.reader-toolbar`
- `.canvas-stage`
- `.reader-canvas`

### 想改登录区样式

先看：

- `.auth-widget`
- `.auth-form`
- `.callback-panel`

---

## 16. 配套阅读建议

如果是样式相关需求，建议同时阅读：

- `docs/ui-location-guide.md`
- `docs/common-tasks.md`
- `docs/development-guide.md`

这样可以同时知道：

- 界面区域在哪
- 任务怎么改
- 结构文件在哪
