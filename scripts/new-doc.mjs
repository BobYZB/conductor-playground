import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const root = process.cwd();
const rl = readline.createInterface({ input, output });

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

try {
  const rawSlug = await rl.question('Slug: ');
  const title = await rl.question('标题: ');
  const category = await rl.question('分类: ');
  const tagsInput = await rl.question('标签（用逗号分隔）: ');

  const slug = normalizeSlug(rawSlug);

  if (!slug || !title.trim() || !category.trim()) {
    throw new Error('slug、标题、分类不能为空。');
  }

  const tags = tagsInput
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const contentPath = path.join(root, 'src', 'content', 'docs', `${slug}.md`);
  const documentDir = path.join(root, 'public', 'documents', slug);
  const today = new Date().toISOString().slice(0, 10);

  const content = `---
title: "${title.trim()}"
slug: "${slug}"
docType: "pdf"
summary: "请补充这份文档的简要说明。"
category: "${category.trim()}"
tags:
${tags.length > 0 ? tags.map((tag) => `  - ${tag}`).join('\n') : '  - 待补充'}
pdfPath: "/documents/${slug}/source.pdf"
publishedAt: "${today}"
updatedAt: "${today}"
featured: false
draft: false
---

请在这里补充文档说明、来源和阅读建议。
`;

  await mkdir(path.dirname(contentPath), { recursive: true });
  await mkdir(documentDir, { recursive: true });
  await writeFile(contentPath, content, { flag: 'wx' });

  output.write(`\n已创建文档条目：${path.relative(root, contentPath)}\n`);
  output.write(`请把 PDF 放入：${path.relative(root, path.join(documentDir, 'source.pdf'))}\n`);
} catch (error) {
  output.write(`${error instanceof Error ? error.message : '创建文档失败。'}\n`);
  process.exitCode = 1;
} finally {
  rl.close();
}
