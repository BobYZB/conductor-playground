# Farmerville

基于 `Astro + GitHub Pages + Supabase` 的公开 PDF 文档站。

## 本地开发

```bash
npm install
npm run dev
```

## 常用脚本

```bash
npm run validate
npm run build
npm run preview
npm run doc:new
```

## 环境变量

复制 `.env.example` 到 `.env`，按 Supabase 项目填写：

```bash
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
PUBLIC_AUTH_REDIRECT_URL=
```

未配置 Supabase 时，站点仍可浏览 PDF，但不会启用登录和跨设备阅读进度同步。

`PUBLIC_AUTH_REDIRECT_URL` 可选。默认会使用当前访问域名拼出 `/auth/callback`，适合纯本地调试；如果你在本地预览页面，但希望邮件里的登录链接跳回线上站点，请把它设成完整回调地址，例如 `https://<your-domain>/farmerville/auth/callback`。

## 新增文档

1. 运行 `npm run doc:new`
2. 输入 `slug`、标题、分类、标签
3. 将 PDF 放到 `public/documents/<slug>/source.pdf`
4. 可选添加封面图到同目录
5. 运行 `npm run validate`
6. 提交并推送到 `master`

## GitHub Pages

当前 `astro.config.mjs` 预设了项目页路径：

- `base: '/farmerville'`
- `site: process.env.SITE_URL ?? 'https://example.com'`

部署前请在仓库设置中启用 GitHub Pages，并在需要时配置：

- 仓库变量 `SITE_URL`
- 仓库变量 `PUBLIC_SUPABASE_URL`
- 仓库变量 `PUBLIC_SUPABASE_ANON_KEY`

## Supabase 配置

1. 创建 Supabase 项目
2. 打开邮箱魔法链接登录
3. 将站点回调地址配置为：
   - `http://localhost:4321/farmerville/auth/callback`
   - 你的 GitHub Pages 线上地址 `/farmerville/auth/callback`
   - 如果设置了 `PUBLIC_AUTH_REDIRECT_URL`，把这个完整地址也加入 Supabase Redirect URLs
4. 执行 `supabase/schema.sql`
