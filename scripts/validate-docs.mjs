import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const docsDir = path.join(root, 'src', 'content', 'docs');

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

async function main() {
  const files = (await readdir(docsDir)).filter((file) => file.endsWith('.md'));
  const seenSlugs = new Set();

  ensure(files.length > 0, '未找到任何文档条目。');

  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    const source = await readFile(fullPath, 'utf8');
    const { data } = matter(source);
    const prefix = `文档 ${file}`;

    ensure(typeof data.title === 'string' && data.title.trim(), `${prefix} 缺少 title。`);
    ensure(typeof data.slug === 'string' && data.slug.trim(), `${prefix} 缺少 slug。`);
    ensure(!seenSlugs.has(data.slug), `${prefix} 的 slug "${data.slug}" 重复。`);
    seenSlugs.add(data.slug);

    ensure(data.docType === 'pdf', `${prefix} 的 docType 必须是 pdf。`);
    ensure(typeof data.summary === 'string' && data.summary.trim(), `${prefix} 缺少 summary。`);
    ensure(typeof data.category === 'string' && data.category.trim(), `${prefix} 缺少 category。`);
    ensure(Array.isArray(data.tags), `${prefix} 的 tags 必须是数组。`);
    ensure(typeof data.pdfPath === 'string' && data.pdfPath.startsWith('/documents/'), `${prefix} 的 pdfPath 无效。`);
    ensure(typeof data.publishedAt === 'string' && isValidDate(data.publishedAt), `${prefix} 的 publishedAt 无效。`);
    ensure(
      typeof data.updatedAt === 'undefined' || (typeof data.updatedAt === 'string' && isValidDate(data.updatedAt)),
      `${prefix} 的 updatedAt 无效。`,
    );

    const expectedSlug = file.replace(/\.md$/, '');
    ensure(data.slug === expectedSlug, `${prefix} 的 slug 必须与文件名一致。`);

    const pdfFullPath = path.join(root, 'public', data.pdfPath.replace(/^\//, ''));
    await access(pdfFullPath).catch(() => {
      throw new Error(`${prefix} 对应的 PDF 不存在：${data.pdfPath}`);
    });
  }

  console.log(`已校验 ${files.length} 份文档，未发现结构错误。`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : '文档校验失败。');
  process.exit(1);
});
