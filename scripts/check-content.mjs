import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
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

function fail(file, message) {
  fatal.push(`${file}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${file}: ${message}`);
}

const htmlFiles = await walk(root);

for (const file of htmlFiles) {
  const raw = await fs.readFile(file, 'utf8');
  const visible = stripComments(raw);

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

  if (/property="og:image"[^>]*og-image\.svg/i.test(raw) || /name="twitter:image"[^>]*og-image\.svg/i.test(raw)) {
    warn(file, 'still references assets/og-image.svg in a social image tag');
  }

  if (/<!--\s*TODO\(launch\):/i.test(raw)) {
    warn(file, 'still contains a TODO(launch) comment');
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

