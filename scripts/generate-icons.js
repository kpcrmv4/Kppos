// Run this script to generate PWA icons
// node scripts/generate-icons.js
// For now, we use SVG fallback. In production, convert SVGs to PNGs.

const fs = require('fs');
const path = require('path');

function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.167)}" fill="#4ade80"/>
  <text x="${size/2}" y="${size * 0.58}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${Math.round(size * 0.29)}" font-weight="bold" fill="white">POS</text>
</svg>`;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

[192, 512].forEach(size => {
  const svg = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
});

console.log('Icons generated! Convert SVGs to PNGs for production.');
