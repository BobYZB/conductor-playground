# Validation and Release

这份文档专门整理本项目常见改动后的验证方法，以及内容变更、功能变更后的最小发布检查。

适合在以下场景使用：

- 改完功能后不知道该验证什么
- 新增文档后想知道最小检查流程
- 发布前想快速过一遍检查项

---

## 1. 常用命令

```bash
npm run build
npm run validate
npm run preview
npm run doc:new
```

说明：

- `npm run build`：验证 Astro 构建是否通过
- `npm run validate`：验证内容文件和 PDF 资源是否匹配
- `npm run preview`：本地预览构建产物
- `npm run doc:new`：创建新文档模板

---

## 2. 按改动类型选择验证方式

### 文案改动

例如：

- 首页标题
- 按钮文案
- 详情页说明

最低验证：

```bash
npm run build
```

### 样式改动

例如：

- 颜色
- 间距
- 双栏布局
- 阅读器样式

最低验证：

```bash
npm run build
```

建议补充：

- 本地手动看一次对应页面

### 阅读器交互改动

例如：

- 翻页
- 缩放
- 跳页
- 键盘 / 滚轮 / 滑动交互

最低验证：

```bash
npm run build
```

建议补充：

- 打开一个详情页手动测试

手动检查重点：

- PDF 是否能加载
- 页码是否正确变化
- 缩放后画布是否正常
- 新交互是否与旧按钮冲突

### 阅读器性能改动

例如：

- 改 Range Request 参数（`rangeChunkSize`、`disableAutoFetch`、`disableStream`）
- 改页面缓存策略（`MAX_CACHE_SIZE`）
- 改预渲染范围（`PAGE_PREFETCH_RADIUS`）

最低验证：

```bash
npm run build
```

建议补充：

- 打开一个大文件 PDF 详情页（如 47MB 的"面试场景题"）
- 确认首页在 3-5 秒内加载完成并显示
- 翻页后回翻，确认已缓存页面秒切
- 使用浏览器开发者工具 Network 面板观察请求行为，确认是 Range Requests 而非全量下载

### 登录与进度同步改动

例如：

- 登录入口
- 回调处理
- 进度恢复
- 进度保存

最低验证：

```bash
npm run build
```

建议补充：

- 未配置 Supabase 时检查降级路径
- 有环境变量时手动跑一遍登录流程

### 内容模型改动

例如：

- 新增 Frontmatter 字段
- 修改字段校验规则

最低验证：

```bash
npm run validate
npm run build
```

### 新增或修改文档内容

例如：

- 新增 PDF 文档
- 修改 `summary`
- 修改 `category`
- 修改 `tags`

最低验证：

```bash
npm run validate
npm run build
```

---

## 3. 手动验证建议

### 首页

建议检查：

- 首页是否正常打开
- 精选卡片是否正常显示
- 跳转到文档库和详情页是否正常

### 文档库

建议检查：

- 搜索是否可用
- 分类筛选是否可用
- 标签筛选是否可用
- 空状态是否正确

### 详情页

建议检查：

- 标题、摘要、标签、日期是否正常显示
- PDF 阅读器是否出现
- 正文说明区是否正常显示

### PDF 阅读器

建议检查：

- 上一页 / 下一页
- 跳页输入
- 缩放
- 键盘翻页
- 滚轮翻页
- 滑动翻页
- 大文件 PDF 首次加载速度（应在 3-5 秒内完成）
- 加载进度条是否正常显示
- 已翻过的页面回翻是否秒切

### 登录与回调

建议检查：

- 登录入口是否正常显示
- 未配置 Supabase 时是否正确降级
- 登录后是否返回原页面

---

## 4. 新增文档后的完整检查

推荐顺序：

1. 运行 `npm run doc:new`
2. 放入 PDF 文件
3. 补全文档 Frontmatter 和正文
4. 运行 `npm run validate`
5. 运行 `npm run build`
6. 可选运行 `npm run preview`

手动检查：

- 首页能否看到文档
- 文档库能否搜索到文档
- 详情页能否打开
- PDF 能否加载

---

## 5. 发布前最小检查单

发布前至少确认：

- `npm run build` 通过
- 如果涉及内容，`npm run validate` 通过
- 站内链接仍正常使用 `withBase()`
- 关键页面可以打开
- 如果动过阅读器，至少手测一次详情页
- 如果动过认证，至少确认未配置 Supabase 时不报错

---

## 6. 改动与验证映射

### 改 `src/styles/global.css`

建议验证：

- `npm run build`
- 对应页面手动检查

### 改 `src/components/PdfViewer.tsx`

建议验证：

- `npm run build`
- 打开详情页手测阅读器
- 如果改了加载性能参数，用大文件 PDF 测试首次加载速度和翻页流畅度

### 改 `src/lib/supabase.ts`

建议验证：

- `npm run build`
- 检查登录入口
- 检查回调页或当前页 code 处理

### 改 `src/content.config.ts`

建议验证：

- `npm run validate`
- `npm run build`

### 改 `scripts/new-doc.mjs` 或 `scripts/validate-docs.mjs`

建议验证：

- 至少运行一次 `npm run validate`

---

## 7. 配套阅读建议

建议同时阅读：

- `docs/common-tasks.md`
- `docs/content-model.md`
- `docs/changelog.md`
