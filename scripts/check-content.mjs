import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://theenergynest.com';
const skipDirs = new Set(['.git', '.agents', '.codex', 'node_modules', '.github', '_drafts']);
const fatal = [];
const warnings = [];
const serviceBannedWords = [
  'heal',
  'healing',
  'cure',
  'treat',
  'treatment',
  'diagnose',
  'relieve',
  'fix',
  'restore your health'
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (skipDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function stripComments(html) {
  return html.replace(/<!--([\s\S]*?)-->/g, '');
}

function stripTags(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function fail(file, message) {
  fatal.push(`${file}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${file}: ${message}`);
}

function pageUrl(filePath) {
  const relative = `/${path.relative(root, filePath).replaceAll(path.sep, '/')}`;
  if (relative === '/index.html') {
    return '/';
  }
  return relative.replace(/index\.html$/, '');
}

function extractCanonical(raw) {
  const match = raw.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return match ? match[1] : null;
}

function extractRobots(raw) {
  const match = raw.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  return match ? match[1].toLowerCase() : '';
}

function extractMetaDescription(raw) {
  const match = raw.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return match ? match[1].trim() : '';
}

function extractMetaContent(raw, attribute, value) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapeRegex(value)}"[^>]*content="([^"]+)"`, 'i');
  const match = raw.match(pattern);
  return match ? match[1].trim() : '';
}

function extractHrefs(raw) {
  return [...raw.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]);
}

function extractHeadings(raw) {
  const cleaned = stripComments(raw.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''));
  const headings = [];
  const pattern = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;

  for (const match of cleaned.matchAll(pattern)) {
    headings.push({
      level: Number(match[1]),
      text: stripTags(match[2])
    });
  }

  return headings;
}

function extractJsonLdBlocks(raw) {
  const blocks = [];
  const pattern = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of raw.matchAll(pattern)) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function walkJsonLd(node, visitor) {
  if (Array.isArray(node)) {
    for (const item of node) {
      walkJsonLd(item, visitor);
    }
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  visitor(node);

  for (const value of Object.values(node)) {
    walkJsonLd(value, visitor);
  }
}

function findJsonLdTypes(node) {
  const types = new Set();
  walkJsonLd(node, (item) => {
    const type = item['@type'];
    if (typeof type === 'string') {
      types.add(type);
    } else if (Array.isArray(type)) {
      for (const value of type) {
        if (typeof value === 'string') {
          types.add(value);
        }
      }
    }
  });
  return types;
}

const htmlFiles = await walk(root);
const sitemapXml = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8').catch(() => '');
const sitemapEntries = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapByPath = new Map(sitemapEntries.map((loc) => {
  const url = new URL(loc);
  return [url.pathname, loc];
}));
const allMetaDescriptions = new Map();
let newestContentMtime = 0;
let llmsMtime = 0;
let sawEmptySameAs = false;

for (const file of htmlFiles) {
  const raw = await fs.readFile(file, 'utf8');
  const visible = stripComments(raw);
  const relativePath = pageUrl(file);
  const robots = extractRobots(raw);
  const noindex = robots.includes('noindex');
  const canonical = extractCanonical(raw);

  const stat = await fs.stat(file);
  newestContentMtime = Math.max(newestContentMtime, stat.mtimeMs);

  if (/REPLACE_WITH/i.test(visible)) {
    fail(file, 'contains REPLACE_WITH outside a comment');
  }

  if (/buy\.stripe\.com/i.test(visible)) {
    fail(file, 'contains buy.stripe.com');
  }

  if (/\b(lorem|ipsum)\b/i.test(visible)) {
    fail(file, 'contains lorem/ipsum');
  }

  if (/\bTODO\b/.test(visible)) {
    fail(file, 'contains TODO outside a comment');
  }

  if (/Do not publish/i.test(visible)) {
    fail(file, 'contains Do not publish outside a comment');
  }

  if (/\bPlaceholder\b/.test(visible)) {
    fail(file, 'contains visible Placeholder text');
  }

  if (/href="[^"]*index\.html[^"]*"/i.test(raw)) {
    fail(file, 'contains an internal href with index.html');
  }

  if (file.includes(`${path.sep}services${path.sep}`)) {
    for (const word of serviceBannedWords) {
      const pattern = new RegExp(word === 'restore your health' ? escapeRegex(word) : `\\b${escapeRegex(word)}\\b`, 'i');
      if (pattern.test(visible)) {
        fail(file, `contains banned service-copy word: ${word}`);
        break;
      }
    }
  }

  const ogImage = extractMetaContent(raw, 'property', 'og:image');
  const twitterImage = extractMetaContent(raw, 'name', 'twitter:image');
  if (ogImage.endsWith('.svg') || twitterImage.endsWith('.svg')) {
    fail(file, 'references an SVG social image');
  }

  if (/<!--\s*TODO\(launch\):/i.test(raw)) {
    warn(file, 'still contains a TODO(launch) comment');
  }

  if (relativePath.startsWith('/booked/') && !noindex) {
    fail(file, 'booked pages must be noindex');
  }

  if (!noindex && sitemapByPath.has(relativePath)) {
    const expected = sitemapByPath.get(relativePath);
    if (canonical !== expected) {
      fail(file, `canonical URL does not match sitemap entry (${canonical || 'missing'} vs ${expected})`);
    }
  } else if (!noindex && !sitemapByPath.has(relativePath)) {
    fail(file, 'page is indexable but missing from sitemap.xml');
  }

  const h1Count = (visible.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) {
    fail(file, `expected exactly one h1, found ${h1Count}`);
  }

  const headings = extractHeadings(raw);
  let previousLevel = 0;
  for (const heading of headings) {
    if (heading.level > previousLevel + 1) {
      fail(file, `heading level skipped from h${previousLevel} to h${heading.level}`);
      break;
    }
    previousLevel = heading.level;
  }

  if (!/Last updated/i.test(visible)) {
    warn(file, 'does not show a visible Last updated date');
  }

  const metaDescription = extractMetaDescription(raw);
  if (metaDescription) {
    const existing = allMetaDescriptions.get(metaDescription) || [];
    existing.push(file);
    allMetaDescriptions.set(metaDescription, existing);
  }

  for (const href of extractHrefs(raw)) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }

    let resolved;
    try {
      resolved = new URL(href, `${siteUrl}${relativePath}`);
    } catch {
      continue;
    }

    if (resolved.origin !== siteUrl) {
      continue;
    }

    if (resolved.pathname.endsWith('.css') || resolved.pathname.endsWith('.js') || resolved.pathname.endsWith('.svg') || resolved.pathname.endsWith('.png') || resolved.pathname.endsWith('.jpg') || resolved.pathname.endsWith('.jpeg') || resolved.pathname.endsWith('.webp') || resolved.pathname.endsWith('.woff2')) {
      continue;
    }

    if (!resolved.pathname.endsWith('/') && resolved.pathname !== '/') {
      fail(file, `internal link points to a non-canonical path: ${href}`);
      continue;
    }

    if (!sitemapByPath.has(resolved.pathname)) {
      fail(file, `internal link points to a path not in sitemap.xml: ${href}`);
    }
  }

  for (const block of extractJsonLdBlocks(raw)) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch {
      fail(file, 'contains invalid JSON-LD');
      continue;
    }

    const types = findJsonLdTypes(parsed);
    for (const type of types) {
      if (/^Medical/i.test(type)) {
        fail(file, `contains banned JSON-LD type: ${type}`);
      }
      if (type === 'AggregateRating' || type === 'Review') {
        fail(file, `contains banned JSON-LD type: ${type}`);
      }
    }

    walkJsonLd(parsed, (item) => {
      if (item['@type'] === 'Organization' && Array.isArray(item.sameAs) && item.sameAs.length === 0) {
        sawEmptySameAs = true;
      }
    });
  }
}

const llmsPath = path.join(root, 'llms.txt');
try {
  llmsMtime = (await fs.stat(llmsPath)).mtimeMs;
} catch {
  llmsMtime = 0;
}

if (llmsMtime && newestContentMtime && llmsMtime < newestContentMtime) {
  warn('llms.txt', 'is older than the newest content file');
}

if (sawEmptySameAs) {
  warnings.push('Organization sameAs array is empty');
}

for (const [description, files] of allMetaDescriptions.entries()) {
  if (files.length > 1) {
    warnings.push(`meta description duplicated across ${files.join(', ')}: ${description}`);
  }
}

if (warnings.length) {
  console.warn('Warnings:');
  for (const item of warnings) {
    console.warn(`- ${item}`);
  }
}

if (fatal.length) {
  console.error('Content check failed:');
  for (const item of fatal) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}
