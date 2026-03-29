# 常见开发任务

这份文档用于解决另一个具体问题：

**知道自己要做什么，但不知道应该按什么步骤改。**

适合在接到具体需求后直接查阅。

---

## 1. 修改首页文案

优先看：

- `src/pages/index.astro`

常见修改项：

- 主标题
- 副标题
- 按钮文案
- 统计卡片文案
- “阅读方式”说明文案

建议验证：

```bash
npm run build
```

---

## 2. 修改首页推荐卡片

优先看：

- `src/pages/index.astro`
- `src/components/DocCard.astro`
- `src/lib/docs.ts`

如何判断改哪里：

- 改卡片内容结构：`src/components/DocCard.astro`
- 改首页取哪些文档：`src/pages/index.astro`
- 改“精选”规则：`src/lib/docs.ts`

---

## 3. 修改文档库筛选逻辑

优先看：

- `src/components/DocFilters.tsx`
- `src/pages/library.astro`
- `src/lib/docs.ts`

常见需求：

- 新增筛选项
- 改搜索范围
- 改 URL Query 同步方式
- 改默认筛选状态

建议步骤：

1. 先改状态定义
2. 再改过滤逻辑
3. 最后改 UI 与 URL 同步

建议验证：

```bash
npm run build
```

---

## 4. 修改 PDF 详情页布局

优先看：

- `src/pages/docs/[slug].astro`
- `src/styles/global.css`

常见需求：

- 阅读器移到左边或右边
- 调整双栏宽度
- 移动端改为上下布局
- 调整详情头部信息区

建议步骤：

1. 先改 Astro 结构顺序
2. 再改 CSS 栅格与响应式
3. 最后本地检查阅读器是否仍正常显示

---

## 5. 修改 PDF 阅读器按钮或交互

优先看：

- `src/components/PdfViewer.tsx`
- `src/styles/global.css`

常见需求：

- 新增按钮
- 改跳页方式
- 改缩放范围
- 改键盘翻页
- 改滚轮翻页
- 改滑动翻页

建议步骤：

1. 先改状态或事件处理函数
2. 再改 JSX 按钮结构
3. 最后补样式

建议验证：

```bash
npm run build
```

手动检查重点：

- 首页进入详情页能否正常打开
- PDF 能否正常加载
- 翻页后页码是否正确
- 缩放后画布是否正常

---

## 6. 修改阅读进度同步逻辑

优先看：

- `src/components/PdfViewer.tsx`
- `src/lib/progress.ts`
- `src/lib/supabase.ts`
- `supabase/schema.sql`

如何判断改哪里：

- 改何时读写进度：`src/components/PdfViewer.tsx`
- 改进度表读写：`src/lib/progress.ts`
- 改认证或用户获取：`src/lib/supabase.ts`
- 改数据库字段：`supabase/schema.sql`

注意事项：

- 同时检查已登录和未登录两条路径
- 不要破坏 Supabase 未配置时的降级体验

---

## 7. 修改登录流程

优先看：

- `src/components/AuthButton.tsx`
- `src/components/AuthCallback.tsx`
- `src/components/AuthCodeHandler.tsx`
- `src/lib/supabase.ts`

常见需求：

- 改登录入口文案
- 改登录成功后的返回地址
- 改回调页提示
- 改登录失败提示

建议验证：

- 至少运行 `npm run build`
- 如果有 Supabase 环境，再手动走一遍登录流程

---

## 8. 新增一个文档字段

优先看：

- `src/content.config.ts`
- `scripts/new-doc.mjs`
- `scripts/validate-docs.mjs`
- 使用该字段的页面或组件

建议步骤：

1. 先改内容 schema
2. 再改新建脚本模板
3. 再改校验脚本
4. 最后改消费该字段的页面或组件

注意事项：

- 只改 schema 不够，脚本和页面要同步

---

## 9. 新增一篇 PDF 文档

优先使用：

- `npm run doc:new`

相关位置：

- 元数据：`src/content/docs/<slug>.md`
- PDF 文件：`public/documents/<slug>/source.pdf`

建议流程：

1. 运行 `npm run doc:new`
2. 把 PDF 放到对应目录
3. 补充摘要和正文说明
4. 运行 `npm run validate`
5. 运行 `npm run build`

---

## 10. 修改站点路径或部署配置

优先看：

- `astro.config.mjs`
- `src/lib/paths.ts`
- `README.md`

常见需求：

- 改 GitHub Pages 子路径
- 改站点线上地址
- 改站内链接拼接规则

注意事项：

- 一旦改了 `base path`，要检查所有站内链接是否仍走 `withBase()`

---

## 11. 修改样式时的建议顺序

建议顺序：

1. 先找页面结构文件
2. 再找对应组件
3. 最后改 `src/styles/global.css`

判断原则：

- 改结构：先改 `.astro` / `.tsx`
- 改视觉：先改 `global.css`
- 改行为：先改 `.tsx`

---

## 12. 最小验证策略

### 文案 / 样式 / 布局调整

至少执行：

```bash
npm run build
```

### 内容模型调整

建议执行：

```bash
npm run validate
npm run build
```

### 阅读器 / 登录 / 同步逻辑调整

建议执行：

```bash
npm run build
```

如果本地有配置环境变量，再补充手动验证：

- 打开文档详情页
- 测试翻页 / 缩放 / 跳页
- 测试登录 / 退出
- 测试进度恢复
