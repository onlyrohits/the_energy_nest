import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const brandDir = path.join(rootDir, 'assets', 'brand');
const socialDir = path.join(rootDir, 'assets', 'social');
const fontDir = path.join(rootDir, 'assets', 'fonts');

const tokensPath = path.join(brandDir, 'tokens.json');
const tokens = JSON.parse(await fs.readFile(tokensPath, 'utf8'));

const brandFonts = {
  display: path.join(fontDir, tokens.fonts.display.file),
  body: path.join(fontDir, tokens.fonts.body.file),
  label: path.join(fontDir, tokens.fonts.label.file),
};

const fontFiles = [brandFonts.display, brandFonts.body, brandFonts.label];

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function ensureDir(filePath) {
  return fs.mkdir(path.dirname(filePath), { recursive: true });
}

function svgShell(width, height, body, { viewBox = `0 0 ${width} ${height}`, defs = '', title = 'The Energy Nest', ariaLabel = 'The Energy Nest' } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(ariaLabel)}">
  <title>${escapeXml(title)}</title>
  ${defs}
  ${body}
</svg>
`;
}

function fontFaceBlock() {
  const display = tokens.fonts.display;
  const body = tokens.fonts.body;
  const label = tokens.fonts.label;
  return `
  <style>
    @font-face {
      font-family: '${display.family}';
      src: url('file://${brandFonts.display}') format('woff2');
      font-style: ${display.style};
      font-weight: ${display.weight};
    }
    @font-face {
      font-family: '${body.family}';
      src: url('file://${brandFonts.body}') format('woff2');
      font-style: ${body.style};
      font-weight: ${body.weight};
    }
    @font-face {
      font-family: '${label.family}';
      src: url('file://${brandFonts.label}') format('woff2');
      font-style: ${label.style};
      font-weight: ${label.weight};
    }
  </style>`;
}

function nestGlowDefs({ id = 'nestGlow', glow = tokens.colors.highlight, core = tokens.colors.bgSoft, opacity = 0.95 } = {}) {
  return `
  <defs>
    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${glow}" stop-opacity="${opacity}"/>
      <stop offset="55%" stop-color="${glow}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  `;
}

function nestMarkGroup({
  simplified = false,
  primary = tokens.colors.primary,
  highlight = tokens.colors.highlight,
  accent = tokens.colors.accent,
  secondary = tokens.colors.secondary,
  glowId = 'nestGlow',
  core = tokens.colors.bgSoft,
  strokeOpacity = {},
} = {}) {
  const primaryOpacity = strokeOpacity.primary ?? 1;
  const highlightOpacity = strokeOpacity.highlight ?? 0.9;
  const accentOpacity = strokeOpacity.accent ?? 0.55;
  const secondaryOpacity = strokeOpacity.secondary ?? 0.4;
  const sideOpacity = strokeOpacity.side ?? 0.55;
  const sideColor = strokeOpacity.sideColor ?? highlight;

  const fullMark = `
    <path d="M20 72c8 18 32 28 40 28s32-10 40-28" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round" opacity="${primaryOpacity}"/>
    <path d="M28 64c12 10 24 16 32 16s20-6 32-16" fill="none" stroke="${highlight}" stroke-width="3.2" stroke-linecap="round" opacity="${highlightOpacity}"/>
    <path d="M24 56c12 12 24 20 36 20s24-8 36-20" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" opacity="${accentOpacity}"/>
    <path d="M32 82c10-8 18-12 28-12s18 4 28 12" fill="none" stroke="${secondary}" stroke-width="2" stroke-linecap="round" opacity="${secondaryOpacity}"/>
    <circle cx="60" cy="54" r="17" fill="url(#${glowId})"/>
    <circle cx="60" cy="54" r="4.4" fill="${core}"/>
    <path d="M24 46c2-11 8-17 16-23" fill="none" stroke="${sideColor}" stroke-width="2.5" stroke-linecap="round" opacity="${sideOpacity}"/>
    <path d="M96 46c-2-11-8-17-16-23" fill="none" stroke="${sideColor}" stroke-width="2.5" stroke-linecap="round" opacity="${sideOpacity}"/>
  `;

  const simpleMark = `
    <path d="M20 72c8 18 32 28 40 28s32-10 40-28" fill="none" stroke="${primary}" stroke-width="5.4" stroke-linecap="round" opacity="${primaryOpacity}"/>
    <path d="M28 64c12 10 24 16 32 16s20-6 32-16" fill="none" stroke="${highlight}" stroke-width="3.5" stroke-linecap="round" opacity="${highlightOpacity}"/>
    <path d="M24 56c12 12 24 20 36 20s24-8 36-20" fill="none" stroke="${accent}" stroke-width="2.9" stroke-linecap="round" opacity="${accentOpacity}"/>
    <circle cx="60" cy="54" r="18" fill="url(#${glowId})"/>
    <circle cx="60" cy="54" r="5.2" fill="${core}"/>
  `;

  return simplified ? simpleMark : fullMark;
}

function logoMarkSvg() {
  return svgShell(
    120,
    120,
    `
  <rect width="120" height="120" rx="28" fill="none"/>
  ${nestMarkGroup()}
  `,
    {
      defs: nestGlowDefs(),
      title: 'The Energy Nest mark',
      ariaLabel: 'The Energy Nest mark',
    },
  );
}

function logoHorizontalSvg({ mono = false, color = tokens.colors.text } = {}) {
  const palette = mono
    ? {
        primary: color,
        highlight: color,
        accent: color,
        secondary: color,
        core: tokens.colors.bgSoft,
        sideColor: color,
        strokeOpacity: { primary: 1, highlight: 0.82, accent: 0.56, secondary: 0.42, side: 0.5 },
      }
    : {
        primary: tokens.colors.primary,
        highlight: tokens.colors.highlight,
        accent: tokens.colors.accent,
        secondary: tokens.colors.secondary,
        core: tokens.colors.bgSoft,
        sideColor: tokens.colors.highlight,
        strokeOpacity: { primary: 1, highlight: 0.9, accent: 0.55, secondary: 0.4, side: 0.55 },
      };

  return svgShell(
    1200,
    400,
    `
  <rect width="1200" height="400" rx="44" fill="none"/>
  <g transform="translate(64 72) scale(1.95)">
    ${nestMarkGroup({ ...palette })}
  </g>
  <text x="318" y="194" fill="${mono ? color : tokens.colors.text}" font-family="${tokens.fonts.display.family}" font-size="106" font-style="italic" font-weight="400" letter-spacing="-0.05em">The Energy Nest</text>
  `,
    {
      defs: nestGlowDefs({ opacity: mono ? 0.75 : 0.95 }),
      title: 'The Energy Nest horizontal lockup',
      ariaLabel: 'The Energy Nest horizontal logo',
    },
  );
}

function logoStackedSvg({ mono = false, color = tokens.colors.text } = {}) {
  const palette = mono
    ? {
        primary: color,
        highlight: color,
        accent: color,
        secondary: color,
        core: tokens.colors.bgSoft,
        sideColor: color,
        strokeOpacity: { primary: 1, highlight: 0.82, accent: 0.56, secondary: 0.42, side: 0.5 },
      }
    : {
        primary: tokens.colors.primary,
        highlight: tokens.colors.highlight,
        accent: tokens.colors.accent,
        secondary: tokens.colors.secondary,
        core: tokens.colors.bgSoft,
        sideColor: tokens.colors.highlight,
        strokeOpacity: { primary: 1, highlight: 0.9, accent: 0.55, secondary: 0.4, side: 0.55 },
      };

  return svgShell(
    840,
    920,
    `
  <rect width="840" height="920" rx="52" fill="none"/>
  <g transform="translate(250 74) scale(2.3)">
    ${nestMarkGroup({ ...palette })}
  </g>
  <text x="420" y="650" text-anchor="middle" fill="${mono ? color : tokens.colors.text}" font-family="${tokens.fonts.display.family}" font-size="112" font-style="italic" font-weight="400" letter-spacing="-0.05em">The Energy Nest</text>
  `,
    {
      defs: nestGlowDefs({ opacity: mono ? 0.75 : 0.95 }),
      title: 'The Energy Nest stacked lockup',
      ariaLabel: 'The Energy Nest stacked logo',
    },
  );
}

function logoIconSvg() {
  return svgShell(
    800,
    800,
    `
  <defs>
    <linearGradient id="iconBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tokens.colors.bgSoft}"/>
      <stop offset="55%" stop-color="${tokens.colors.bg}"/>
      <stop offset="100%" stop-color="${tokens.colors.bgWarm}"/>
    </linearGradient>
    <radialGradient id="iconHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${tokens.colors.highlight}" stop-opacity="0.90"/>
      <stop offset="55%" stop-color="${tokens.colors.highlight}" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="${tokens.colors.highlight}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" rx="180" fill="url(#iconBg)"/>
  <circle cx="400" cy="396" r="180" fill="url(#iconHalo)"/>
  <circle cx="400" cy="396" r="290" fill="${tokens.colors.bgSoft}" fill-opacity="0.10"/>
  <g transform="translate(220 226) scale(2.95)">
    ${nestMarkGroup()}
  </g>
  `,
    {
      title: 'The Energy Nest icon',
      ariaLabel: 'The Energy Nest icon',
      defs: '',
    },
  );
}

function logoMonoDarkSvg() {
  return logoHorizontalSvg({ mono: true, color: tokens.colors.text });
}

function logoMonoLightSvg() {
  return logoHorizontalSvg({ mono: true, color: tokens.colors.bgSoft });
}

function faviconSvg() {
  return svgShell(
    120,
    120,
    `
  <defs>
    <radialGradient id="faviconGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${tokens.colors.highlight}" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="${tokens.colors.highlight}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${tokens.colors.highlight}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="120" height="120" rx="30" fill="${tokens.colors.bgSoft}"/>
  <path d="M20 72c8 18 32 28 40 28s32-10 40-28" fill="none" stroke="${tokens.colors.primary}" stroke-width="5.6" stroke-linecap="round"/>
  <path d="M28 64c12 10 24 16 32 16s20-6 32-16" fill="none" stroke="${tokens.colors.highlight}" stroke-width="3.6" stroke-linecap="round" opacity="0.95"/>
  <path d="M24 56c12 12 24 20 36 20s24-8 36-20" fill="none" stroke="${tokens.colors.accent}" stroke-width="2.8" stroke-linecap="round" opacity="0.42"/>
  <circle cx="60" cy="54" r="18" fill="url(#faviconGlow)"/>
  <circle cx="60" cy="54" r="5.2" fill="${tokens.colors.bgSoft}"/>
  `,
    {
      title: 'The Energy Nest favicon',
      ariaLabel: 'The Energy Nest favicon',
      defs: '',
    },
  );
}

function backgroundSvg(width = 2560, height = 1440) {
  const rx1 = width * 0.18;
  const ry1 = height * 0.16;
  const rx2 = width * 0.83;
  const ry2 = height * 0.10;
  const rx3 = width * 0.88;
  const ry3 = height * 0.84;
  const r = Math.min(width, height) * 0.18;
  const arcY = height * 0.73;
  const arcY2 = height * 0.70;
  const arcY3 = height * 0.67;
  const bottomLeft = width * 0.08;
  const bottomRight = width * 0.92;
  const centerX = width * 0.5;
  const shellX1 = width * 0.16;
  const shellX2 = width * 0.84;
  const shellX3 = width * 0.12;
  const shellX4 = width * 0.88;

  return svgShell(
    width,
    height,
    `
  <defs>
    <linearGradient id="backgroundGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tokens.colors.bgSoft}"/>
      <stop offset="54%" stop-color="${tokens.colors.bg}"/>
      <stop offset="100%" stop-color="${tokens.colors.bgWarm}"/>
    </linearGradient>
    <radialGradient id="backgroundGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${tokens.colors.highlight}" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="${tokens.colors.highlight}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${tokens.colors.highlight}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#backgroundGrad)"/>
  <circle cx="${rx1}" cy="${ry1}" r="${r * 0.95}" fill="${tokens.colors.accent}" fill-opacity="0.10"/>
  <circle cx="${rx2}" cy="${ry2}" r="${r * 1.08}" fill="${tokens.colors.secondary}" fill-opacity="0.10"/>
  <circle cx="${rx3}" cy="${ry3}" r="${r * 1.12}" fill="${tokens.colors.highlight}" fill-opacity="0.10"/>
  <circle cx="${centerX}" cy="${height * 0.54}" r="${Math.min(width, height) * 0.08}" fill="url(#backgroundGlow)"/>
  <path d="M ${bottomLeft} ${arcY} C ${width * 0.24} ${height * 0.92}, ${width * 0.76} ${height * 0.92}, ${bottomRight} ${arcY}" fill="none" stroke="${tokens.colors.primary}" stroke-width="${Math.max(6, Math.round(width * 0.006))}" stroke-linecap="round" opacity="0.82"/>
  <path d="M ${shellX3} ${arcY2} C ${width * 0.22} ${height * 0.80}, ${width * 0.78} ${height * 0.80}, ${shellX4} ${arcY2}" fill="none" stroke="${tokens.colors.highlight}" stroke-width="${Math.max(4, Math.round(width * 0.004))}" stroke-linecap="round" opacity="0.58"/>
  <path d="M ${shellX1} ${arcY3} C ${width * 0.30} ${height * 0.84}, ${width * 0.70} ${height * 0.84}, ${shellX2} ${arcY3}" fill="none" stroke="${tokens.colors.secondary}" stroke-width="${Math.max(3, Math.round(width * 0.003))}" stroke-linecap="round" opacity="0.44"/>
  <path d="M ${width * 0.18} ${height * 0.16} C ${width * 0.14} ${height * 0.10}, ${width * 0.12} ${height * 0.06}, ${width * 0.10} ${height * 0.04}" fill="none" stroke="${tokens.colors.highlight}" stroke-width="${Math.max(3, Math.round(width * 0.0025))}" stroke-linecap="round" opacity="0.42"/>
  <path d="M ${width * 0.82} ${height * 0.16} C ${width * 0.86} ${height * 0.10}, ${width * 0.88} ${height * 0.06}, ${width * 0.90} ${height * 0.04}" fill="none" stroke="${tokens.colors.highlight}" stroke-width="${Math.max(3, Math.round(width * 0.0025))}" stroke-linecap="round" opacity="0.42"/>
  `,
    {
      title: 'The Energy Nest background',
      ariaLabel: 'The Energy Nest background',
      defs: '',
    },
  );
}

function renderSvgBuffer(svg, scale = 2) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    font: {
      loadSystemFonts: false,
      fontFiles,
      defaultFontFamily: tokens.fonts.body.family,
      serifFamily: tokens.fonts.display.family,
      sansSerifFamily: tokens.fonts.body.family,
    },
  });
  return Buffer.from(resvg.render().asPng());
}

async function writeSvgFile(filePath, svg) {
  await ensureDir(filePath);
  await fs.writeFile(filePath, svg);
}

async function writeRasterFile({ svg, width, height, outPath, format = 'png', composite = [] }) {
  await ensureDir(outPath);
  const canvasWidth = width * 2;
  const canvasHeight = height * 2;
  const baseBuffer = renderSvgBuffer(svg, 1);
  const resizedBase = await sharp(baseBuffer)
    .resize(canvasWidth, canvasHeight, { fit: 'cover', position: 'centre', kernel: sharp.kernel.lanczos3 })
    .toColourspace('srgb')
    .toBuffer();
  let image = sharp(resizedBase);

  if (composite.length > 0) {
    const layers = [];
    for (const layer of composite) {
      const layerBuffer = renderSvgBuffer(layer.svg, 2);
      const resizedLayer = await sharp(layerBuffer)
        .resize(layer.width * 2, layer.height * 2, { fit: 'contain', kernel: sharp.kernel.lanczos3 })
        .toBuffer();
      layers.push({
        input: resizedLayer,
        left: Math.round(layer.x * 2),
        top: Math.round(layer.y * 2),
      });
    }
    const composedBase = await image.composite(layers).toBuffer();
    image = sharp(composedBase);
  }

  const finalImage = image.resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 });

  if (format === 'jpg') {
    await finalImage.jpeg({ quality: 88, mozjpeg: true, force: true }).toFile(outPath);
  } else {
    await finalImage.png({ compressionLevel: 9, adaptiveFiltering: true, force: true }).toFile(outPath);
  }
}

async function fitBufferWithin(buffer, maxWidth, maxHeight) {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width <= maxWidth && height <= maxHeight) {
    return buffer;
  }

  return sharp(buffer)
    .resize(maxWidth, maxHeight, { fit: 'contain', kernel: sharp.kernel.lanczos3 })
    .toBuffer();
}

function logoOverlay({ kind, width, height, x, y, fill = tokens.colors.text }) {
  const svg = kind === 'stacked'
    ? logoStackedSvg({ mono: false })
    : kind === 'horizontal'
      ? logoHorizontalSvg({ mono: false })
      : logoMarkSvg();

  return { svg, width, height, x, y, fill };
}

function textOverlaySvg({ width, height, title, subtitle, eyebrow, align = 'left', titleSize = 72, subtitleSize = 28, eyebrowSize = 20, card = null, textFill = tokens.colors.text, mutedFill = tokens.colors.textMuted }) {
  const titleAnchor = align === 'center' ? 'middle' : 'start';
  const titleX = card ? card.x + card.padding : align === 'center' ? width / 2 : width * 0.08;
  const eyebrowX = titleX;
  const subtitleX = titleX;
  const titleY = card ? card.y + card.padding + 78 : height * 0.50;
  const eyebrowY = card ? card.y + card.padding + 34 : titleY - 56;
  const subtitleY = card ? titleY + 46 : titleY + 58;
  const cardMarkup = card
    ? `
  <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="rgba(255, 253, 249, 0.72)" stroke="${tokens.colors.border}" stroke-width="2"/>
  `
    : '';

  return svgShell(
    width,
    height,
    `
  <defs>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="${tokens.colors.text}" flood-opacity="0.12"/>
    </filter>
  </defs>
  ${cardMarkup}
  ${card ? '' : ''}
  <g ${card ? 'filter="url(#cardShadow)"' : ''}>
    ${eyebrow ? `<text x="${eyebrowX}" y="${eyebrowY}" fill="${tokens.colors.primary}" font-family="${tokens.fonts.label.family}" font-size="${eyebrowSize}" font-weight="600" letter-spacing="0.28em" text-anchor="${titleAnchor}">${escapeXml(eyebrow.toUpperCase())}</text>` : ''}
    <text x="${titleX}" y="${titleY}" fill="${textFill}" font-family="${tokens.fonts.display.family}" font-size="${titleSize}" font-style="italic" font-weight="400" letter-spacing="-0.04em" text-anchor="${titleAnchor}">${escapeXml(title)}</text>
    ${subtitle ? `<text x="${subtitleX}" y="${subtitleY}" fill="${mutedFill}" font-family="${tokens.fonts.body.family}" font-size="${subtitleSize}" font-weight="400" text-anchor="${titleAnchor}">${escapeXml(subtitle)}</text>` : ''}
  </g>
  `,
    {
      title: 'The Energy Nest template text',
      ariaLabel: 'The Energy Nest template text',
      defs: '',
    },
  );
}

function coverOverlaySvg({ width, height, subtitle, align = 'left' }) {
  const titleX = width * 0.18;
  const titleY = height * 0.50;
  const subY = height * 0.67;
  const anchor = align === 'center' ? 'middle' : 'start';
  const textX = align === 'center' ? width / 2 : titleX;
  return svgShell(
    width,
    height,
    `
  <text x="${textX}" y="${titleY}" fill="${tokens.colors.text}" font-family="${tokens.fonts.display.family}" font-size="${Math.round(height * 0.20)}" font-style="italic" font-weight="400" letter-spacing="-0.05em" text-anchor="${anchor}">The Energy Nest</text>
  <text x="${textX}" y="${subY}" fill="${tokens.colors.textMuted}" font-family="${tokens.fonts.body.family}" font-size="${Math.round(height * 0.08)}" font-weight="400" text-anchor="${anchor}">${escapeXml(subtitle)}</text>
  `,
    {
      title: 'The Energy Nest cover overlay',
      ariaLabel: 'The Energy Nest cover overlay',
      defs: '',
    },
  );
}

function profileAssets() {
  return [
    { out: path.join(socialDir, 'facebook', 'profile.png'), width: 500, height: 500 },
    { out: path.join(socialDir, 'instagram', 'profile.png'), width: 500, height: 500 },
    { out: path.join(socialDir, 'youtube', 'avatar.png'), width: 800, height: 800 },
  ];
}

function socialAssetPlan() {
  return [
    {
      out: path.join(socialDir, 'facebook', 'cover.png'),
      width: 851,
      height: 315,
      background: true,
      layers: [
        { kind: 'horizontal', width: 420, height: 140, x: 110, y: 86 },
        { kind: 'text', width: 420, height: 120, x: 110, y: 196, title: 'A calm place to land between deploys.', subtitle: 'Quiet energy work for stressed software people.', eyebrow: 'The Energy Nest', align: 'left', titleSize: 24, subtitleSize: 17, eyebrowSize: 12, card: null },
      ],
    },
    {
      out: path.join(socialDir, 'youtube', 'banner.png'),
      width: 2560,
      height: 1440,
      background: true,
      layers: [
        { kind: 'horizontal', width: 1060, height: 354, x: 760, y: 560 },
        { kind: 'text', width: 900, height: 180, x: 780, y: 820, title: 'A calm place to land between deploys.', subtitle: 'Supportive guidance, Reiki, readings, meditation, intention-setting.', eyebrow: 'The Energy Nest', align: 'left', titleSize: 66, subtitleSize: 30, eyebrowSize: 22, card: null },
      ],
    },
    {
      out: path.join(socialDir, 'instagram', 'post-portrait.png'),
      width: 1080,
      height: 1350,
      background: true,
      layers: [
        { kind: 'stacked', width: 540, height: 590, x: 270, y: 110 },
        {
          kind: 'text',
          width: 860,
          height: 440,
          x: 110,
          y: 730,
          title: 'HEADLINE',
          subtitle: 'Optional supporting line',
          eyebrow: 'Template',
          align: 'left',
          titleSize: 82,
          subtitleSize: 30,
          eyebrowSize: 16,
          card: { x: 95, y: 690, width: 890, height: 500, radius: 36, padding: 48 },
        },
      ],
    },
    {
      out: path.join(socialDir, 'instagram', 'post-square.png'),
      width: 1080,
      height: 1080,
      background: true,
      layers: [
        { kind: 'stacked', width: 500, height: 545, x: 290, y: 74 },
        {
          kind: 'text',
          width: 820,
          height: 360,
          x: 130,
          y: 600,
          title: 'HEADLINE',
          subtitle: 'Optional supporting line',
          eyebrow: 'Template',
          align: 'left',
          titleSize: 72,
          subtitleSize: 28,
          eyebrowSize: 15,
          card: { x: 120, y: 560, width: 840, height: 390, radius: 34, padding: 44 },
        },
      ],
    },
    {
      out: path.join(socialDir, 'instagram', 'story-reel.png'),
      width: 1080,
      height: 1920,
      background: true,
      layers: [
        { kind: 'stacked', width: 520, height: 570, x: 280, y: 420 },
        {
          kind: 'text',
          width: 820,
          height: 560,
          x: 130,
          y: 940,
          title: 'HEADLINE',
          subtitle: 'Optional supporting line',
          eyebrow: 'Template',
          align: 'left',
          titleSize: 86,
          subtitleSize: 30,
          eyebrowSize: 15,
          card: { x: 110, y: 880, width: 860, height: 620, radius: 40, padding: 50 },
        },
      ],
    },
    {
      out: path.join(socialDir, 'facebook', 'og-share.png'),
      width: 1200,
      height: 630,
      background: true,
      layers: [
        { kind: 'horizontal', width: 610, height: 204, x: 80, y: 90 },
        {
          kind: 'text',
          width: 520,
          height: 420,
          x: 640,
          y: 104,
          title: 'HEADLINE',
          subtitle: 'Optional supporting line',
          eyebrow: 'Share image',
          align: 'left',
          titleSize: 64,
          subtitleSize: 26,
          eyebrowSize: 14,
          card: { x: 612, y: 92, width: 518, height: 436, radius: 34, padding: 40 },
        },
      ],
    },
    {
      out: path.join(socialDir, 'youtube', 'thumbnail.jpg'),
      width: 1280,
      height: 720,
      background: true,
      layers: [
        { kind: 'stacked', width: 420, height: 460, x: 820, y: 120 },
        {
          kind: 'text',
          width: 620,
          height: 500,
          x: 90,
          y: 120,
          title: 'HEADLINE',
          subtitle: 'Optional supporting line',
          eyebrow: 'Thumbnail',
          align: 'left',
          titleSize: 70,
          subtitleSize: 28,
          eyebrowSize: 16,
          card: { x: 70, y: 96, width: 620, height: 520, radius: 36, padding: 44 },
        },
      ],
    },
  ];
}

async function build() {
  const fontChecks = await Promise.all(fontFiles.map(async (file) => {
    await fs.access(file);
    return path.basename(file);
  }));

  const masterFiles = [
    { out: path.join(brandDir, 'logo-mark.svg'), svg: logoMarkSvg() },
    { out: path.join(brandDir, 'logo-horizontal.svg'), svg: logoHorizontalSvg() },
    { out: path.join(brandDir, 'logo-stacked.svg'), svg: logoStackedSvg() },
    { out: path.join(brandDir, 'logo-icon.svg'), svg: logoIconSvg() },
    { out: path.join(brandDir, 'logo-mono-dark.svg'), svg: logoMonoDarkSvg() },
    { out: path.join(brandDir, 'logo-mono-light.svg'), svg: logoMonoLightSvg() },
    { out: path.join(brandDir, 'favicon.svg'), svg: faviconSvg() },
    { out: path.join(brandDir, 'background.svg'), svg: backgroundSvg(2560, 1440) },
  ];

  const summary = [];

  for (const master of masterFiles) {
    await writeSvgFile(master.out, master.svg);
    const stat = await fs.stat(master.out);
    summary.push({
      asset: path.relative(rootDir, master.out),
      dimensions: master.svg.match(/width="(\d+)" height="(\d+)"/)?.slice(1, 3).join('x') || 'svg',
      size: formatBytes(stat.size),
    });
  }

  const backgroundBuffer = renderSvgBuffer(backgroundSvg(2560, 1440), 2);

  for (const asset of profileAssets()) {
    const iconSvg = logoIconSvg();
    await writeRasterFile({
      svg: iconSvg,
      width: asset.width,
      height: asset.height,
      outPath: asset.out,
      format: 'png',
    });
    const stat = await fs.stat(asset.out);
    summary.push({
      asset: path.relative(rootDir, asset.out),
      dimensions: `${asset.width}x${asset.height}`,
      size: formatBytes(stat.size),
    });
  }

  for (const asset of socialAssetPlan()) {
    const canvasWidth = asset.width * 2;
    const canvasHeight = asset.height * 2;
    const resizedBase = await sharp(backgroundBuffer)
      .resize(canvasWidth, canvasHeight, { fit: 'cover', position: 'centre', kernel: sharp.kernel.lanczos3 })
      .toColourspace('srgb')
      .toBuffer();
    let canvas = sharp(resizedBase);

    const overlayLayers = [];

    for (const layer of asset.layers) {
      if (layer.kind === 'text') {
        const overlaySvg = textOverlaySvg({
          width: canvasWidth,
          height: canvasHeight,
          title: layer.title,
          subtitle: layer.subtitle,
          eyebrow: layer.eyebrow,
          align: layer.align,
          titleSize: layer.titleSize * 2,
          subtitleSize: layer.subtitleSize * 2,
          eyebrowSize: layer.eyebrowSize * 2,
          card: layer.card
            ? {
                x: layer.card.x * 2,
                y: layer.card.y * 2,
                width: layer.card.width * 2,
                height: layer.card.height * 2,
                radius: layer.card.radius * 2,
                padding: layer.card.padding * 2,
              }
            : null,
        });
        const overlayBuffer = await fitBufferWithin(
          renderSvgBuffer(overlaySvg, 1),
          canvasWidth,
          canvasHeight,
        );
        overlayLayers.push({ input: overlayBuffer });
      } else {
        const logoSvg = layer.kind === 'horizontal'
          ? logoHorizontalSvg()
          : layer.kind === 'stacked'
            ? logoStackedSvg()
            : logoMarkSvg();
        const logoBuffer = renderSvgBuffer(logoSvg, 2);
        const resizedLogo = await sharp(logoBuffer)
          .resize(layer.width * 2, layer.height * 2, { fit: 'contain', kernel: sharp.kernel.lanczos3 })
          .toBuffer();
        const fittedLogo = await fitBufferWithin(
          resizedLogo,
          canvasWidth - Math.round(layer.x * 2),
          canvasHeight - Math.round(layer.y * 2),
        );
        const left = Math.round(layer.x * 2);
        const top = Math.round(layer.y * 2);
        overlayLayers.push({
          input: fittedLogo,
          left,
          top,
        });
      }
    }

    const composedBase = await canvas.composite(overlayLayers).toBuffer();

    const finalImage = sharp(composedBase).resize(asset.width, asset.height, { fit: 'fill', kernel: sharp.kernel.lanczos3 });
    const isJpg = asset.out.endsWith('.jpg');
    if (isJpg) {
      await finalImage.jpeg({ quality: 86, mozjpeg: true, force: true }).toFile(asset.out);
    } else {
      await finalImage.png({ compressionLevel: 9, adaptiveFiltering: true, force: true }).toFile(asset.out);
    }

    const stat = await fs.stat(asset.out);
    summary.push({
      asset: path.relative(rootDir, asset.out),
      dimensions: `${asset.width}x${asset.height}`,
      size: formatBytes(stat.size),
    });
  }

  console.log('');
  console.log('| Asset | Dimensions | Size |');
  console.log('| --- | --- | --- |');
  for (const row of summary) {
    console.log(`| ${row.asset} | ${row.dimensions} | ${row.size} |`);
  }
  console.log('');
  console.log(`Loaded fonts: ${fontChecks.join(', ')}`);
}

await build();
