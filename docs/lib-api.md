# Lib API

这份文档整理 `src/lib/` 下主要工具函数与数据访问函数的职责、输入输出和影响范围。

适合在以下场景使用：

- 想改工具函数
- 想扩展数据结构
- 想知道改某个 `lib` 会波及哪些页面和组件

---

## 1. `src/lib/docs.ts`

职责：

- 获取公开文档
- 按更新时间排序
- 生成精选列表
- 生成分类列表
- 生成标签列表

主要导出：

### `getPublishedDocs()`

输入：

- 无

输出：

- Promise\<PDF 文档条目数组\>

行为：

- 从 `astro:content` 读取 `docs`
- 过滤 `draft`
- 只保留 `docType === 'pdf'`
- 按最近更新时间排序

影响范围：

- `src/pages/index.astro`
- `src/pages/library.astro`

### `getFeaturedDocs(entries)`

输入：

- 文档数组

输出：

- `featured === true` 的文档数组

### `getCategories(entries)`

输入：

- 文档数组

输出：

- 去重并排序后的分类数组

### `getTags(entries)`

输入：

- 文档数组

输出：

- 去重并排序后的标签数组

注意事项：

- 如果改了文档排序规则，会同时影响首页和文档库

---

## 2. `src/lib/format.ts`

职责：

- 格式化日期显示

主要导出：

### `formatDate(value)`

输入：

- `string | undefined`

输出：

- 格式化后的中文日期字符串
- 如果无值则返回 `未设置`
- 如果值非法则原样返回

影响范围：

- 卡片更新时间
- 详情页日期
- 文档库卡片日期

---

## 3. `src/lib/paths.ts`

职责：

- 在存在 `base path` 的情况下统一生成站内链接

主要导出：

### `withBase(path)`

输入：

- 路径字符串

输出：

- 拼好 `BASE_URL` 的站内路径

影响范围：

- 几乎所有页面和组件中的站内跳转

注意事项：

- 站内路径不要手写，尽量统一走这个函数

---

## 4. `src/lib/progress.ts`

职责：

- 读取阅读进度
- 保存阅读进度

依赖：

- `src/lib/supabase.ts`

主要导出：

### `getReadingProgress(docSlug)`

输入：

- `docSlug: string`

输出：

- `Promise<ReadingProgress | null>`

行为：

- 获取当前登录用户
- 查询 `reading_progress`
- 返回该用户对该文档的最新页码

### `upsertReadingProgress(docSlug, lastPage)`

输入：

- `docSlug: string`
- `lastPage: number`

输出：

- `Promise<void>`

行为：

- 获取当前登录用户
- 以 `(user_id, doc_slug)` 为冲突键 upsert

影响范围：

- `src/components/PdfViewer.tsx`
- Supabase 数据表 `reading_progress`

注意事项：

- 如果用户未登录，这一层应安全退出

---

## 5. `src/lib/supabase.ts`

职责：

- 创建浏览器端 Supabase Client
- 判断环境变量是否完整
- 获取用户
- 登录
- 退出
- 监听登录状态
- 等待认证回调完成

主要导出：

### 常量

- `AUTH_RETURN_TO_KEY`

用于：

- 保存登录前页面地址

### `getAuthCallbackUrl(origin?)`

输入：

- 可选 `origin`

输出：

- 登录回调地址字符串

### `getDefaultPostAuthUrl(origin?)`

输入：

- 可选 `origin`

输出：

- 默认登录完成后的跳转地址

### `isSupabaseConfigured()`

输入：

- 无

输出：

- `boolean`

### `getSupabaseClient()`

输入：

- 无

输出：

- 浏览器端 Supabase Client 或 `null`

### `getCurrentUser()`

输入：

- 无

输出：

- `Promise<User | null>`

### `signInWithMagicLink(email, redirectTo)`

输入：

- `email: string`
- `redirectTo: string`

输出：

- `Promise<void>`

### `signOut()`

输入：

- 无

输出：

- `Promise<void>`

### `onAuthStateChange(callback)`

输入：

- 用户状态变化回调

输出：

- 取消订阅函数

### `waitForAuthCallback(timeoutMs?)`

输入：

- 可选超时时间

输出：

- `Promise<Session>`

影响范围：

- `src/components/AuthButton.tsx`
- `src/components/AuthCallback.tsx`
- `src/components/AuthCodeHandler.tsx`
- `src/components/PdfViewer.tsx`
- `src/lib/progress.ts`

注意事项：

- 这是登录和同步能力的核心底层
- 修改这里时，要同时检查登录入口、回调页、全局 code 处理器、阅读器

---

## 6. 修改建议

### 改 `docs.ts`

通常影响：

- 首页
- 文档库

### 改 `paths.ts`

通常影响：

- 所有站内链接

### 改 `progress.ts`

通常影响：

- 阅读进度恢复
- 阅读进度保存

### 改 `supabase.ts`

通常影响：

- 登录入口
- 回调页
- 当前页 code 处理
- 阅读器同步

---

## 7. 配套阅读建议

建议同时阅读：

- `docs/module-dependency-map.md`
- `docs/development-guide.md`
- `docs/common-tasks.md`
