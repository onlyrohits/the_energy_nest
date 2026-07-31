import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://theenergynest.com';
const exclude = new Set(['/booked/', '/404/', '/set-a-good-intention/', '/services/set-a-good-intention/', '/services/set-a-good-intention/index.html']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === '.agents' || entry.name === '.codex' || entry.name === 'node_modules' || entry.name === '.github' || entry.name === '_drafts') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (entry.isFile() && entry.name === 'index.html') {
      files.push(full);
    }
  }

  return files;
}

function pageUrl(filePath) {
  const relative = `/${path.relative(root, filePath).replaceAll(path.sep, '/')}`;
  if (relative === '/index.html') {
    return '/';
  }
  return relative.replace(/index\.html$/, '');
}

const files = await walk(root);
const urls = [];

for (const file of files) {
  const urlPath = pageUrl(file);
  if (exclude.has(urlPath) || urlPath.startsWith('/_drafts/')) {
    continue;
  }
  const stat = await fs.stat(file);
  const lastmod = stat.mtime.toISOString().slice(0, 10);
  urls.push({ loc: `${siteUrl}${urlPath}`, lastmod });
}

urls.sort((a, b) => a.loc.localeCompare(b.loc));

const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const url of urls) {
  xml.push('  <url>');
  xml.push(`    <loc>${url.loc}</loc>`);
  xml.push(`    <lastmod>${url.lastmod}</lastmod>`);
  xml.push('  </url>');
}
xml.push('</urlset>', '');

await fs.writeFile(path.join(root, 'sitemap.xml'), xml.join('\n'));

