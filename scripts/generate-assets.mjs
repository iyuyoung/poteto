#!/usr/bin/env node
/**
 * Generates all required raster brand assets from crisp SVG sources using sharp:
 * - public/logo.png (512x512)
 * - public/icon-192.png (192x192)
 * - public/icon-512.png (512x512)
 * - public/apple-touch-icon.png (180x180)
 * - public/favicon.ico (32x32 ICO container wrapping PNG)
 * - public/og-image.png (1200x630 OpenGraph card)
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
const logoSvgPath = path.join(publicDir, 'logo.svg');
const logoSvg = fs.readFileSync(logoSvgPath);

// Build minimal valid ICO wrapping a 32x32 PNG
function pngToIco(pngBuf, width = 32, height = 32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = 1 (ICO)
  header.writeUInt16LE(1, 4); // image count = 1

  const entry = Buffer.alloc(16);
  entry.writeUInt8(width === 256 ? 0 : width, 0);
  entry.writeUInt8(height === 256 ? 0 : height, 1);
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBuf.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)

  return Buffer.concat([header, entry, pngBuf]);
}

const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#1C1917" fill-opacity="0.08" />
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#FAF7F0" />
  <rect width="1200" height="630" fill="url(#dots)" />

  <!-- Outer Bureaucratic Card -->
  <rect x="52" y="48" width="1096" height="534" rx="28" fill="#FFFFFF" stroke="#1C1917" stroke-width="5" />
  <rect x="66" y="62" width="1068" height="506" rx="20" fill="none" stroke="#D6CFC2" stroke-width="2" />

  <!-- Top Tag -->
  <rect x="104" y="102" width="330" height="38" rx="19" fill="#1C1917" />
  <text x="128" y="127" font-family="monospace" font-size="18" font-weight="700" fill="#FAF7F0">POTETO HUMAN AUDIT BUREAU</text>

  <!-- Main Title -->
  <text x="104" y="226" font-family="sans-serif" font-size="66" font-weight="800" fill="#1C1917">POTETO</text>
  <text x="104" y="294" font-family="sans-serif" font-size="38" font-weight="700" fill="#44403C">90-Second Daily Human Audit</text>
  <text x="104" y="346" font-family="sans-serif" font-size="24" font-weight="500" fill="#78716C">Outsmart a Hokkaido Potato in 3 Absurd Stages</text>

  <!-- Fake CAPTCHA Pill -->
  <rect x="104" y="396" width="440" height="92" rx="18" fill="#FAF7F0" stroke="#D6CFC2" stroke-width="3" />
  <rect x="132" y="422" width="40" height="40" rx="6" fill="#FFFFFF" stroke="#2563EB" stroke-width="4" />
  <path d="M141 442 L149 450 L163 432" fill="none" stroke="#2563EB" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <text x="194" y="451" font-family="sans-serif" font-size="28" font-weight="700" fill="#1C1917">I am not a potato</text>

  <!-- Right Side Potato ID Frame -->
  <rect x="756" y="128" width="320" height="320" rx="28" fill="#FAF7F0" stroke="#1C1917" stroke-width="5" />
  <g transform="translate(796, 168) scale(2.4)">
    <path d="M24 52 C22 30, 38 18, 56 20 C75 22, 84 37, 81 58 C78 76, 61 84, 42 82 C26 80, 25 66, 24 52 Z" fill="#E9C89B" stroke="#1C1917" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="34" cy="68" r="2.2" fill="#B88B58" />
    <circle cx="68" cy="64" r="2" fill="#B88B58" />
    <circle cx="42" cy="46" r="3.5" fill="#1C1917" />
    <circle cx="60" cy="46" r="3.5" fill="#1C1917" />
    <path d="M47 56 H55" stroke="#1C1917" stroke-width="3.5" stroke-linecap="round" />
  </g>
  <!-- Stamp -->
  <g transform="translate(812, 474) rotate(-4)">
    <rect x="0" y="0" width="224" height="48" rx="10" fill="#F0FDF4" stroke="#15803D" stroke-width="3.5" />
    <text x="20" y="31" font-family="monospace" font-size="20" font-weight="800" fill="#15803D">POTETO #01 CONTROL</text>
  </g>
</svg>`);

async function main() {
  await sharp(logoSvg).resize(512, 512).png().toFile(path.join(publicDir, 'logo.png'));
  await sharp(logoSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(logoSvg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(logoSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  const fav32 = await sharp(logoSvg).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngToIco(fav32, 32, 32));

  await sharp(ogSvg).resize(1200, 630).png().toFile(path.join(publicDir, 'og-image.png'));
  console.log('[assets] Generated logo.png, icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico, og-image.png');
}

main().catch((err) => {
  console.error('[assets] Failed:', err);
  process.exit(1);
});
