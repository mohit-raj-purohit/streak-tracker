/**
 * Generate PNG icons for PWA using raw pixel data.
 * Creates solid gold rounded-rect icons with a white lightning bolt.
 * Run: node scripts/gen-icons.js
 */
const fs = require('fs');
const { createCanvas } = (() => {
  // Try native canvas, fall back to manual PNG generation
  try { return require('canvas'); } catch { return { createCanvas: null }; }
})();

function drawIcon(size) {
  if (createCanvas) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const r = size * 0.21;

    // Rounded rect with gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#c9a84c');
    grad.addColorStop(1, '#b8860b');
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r); ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size); ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r); ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Lightning bolt
    const s = size / 512;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(280*s, 80*s); ctx.lineTo(180*s, 260*s);
    ctx.lineTo(260*s, 260*s); ctx.lineTo(220*s, 432*s);
    ctx.lineTo(360*s, 232*s); ctx.lineTo(270*s, 232*s);
    ctx.closePath();
    ctx.fill();

    return canvas.toBuffer('image/png');
  }

  // Fallback: create a simple solid-color PNG without canvas
  return createSimplePNG(size);
}

// Minimal PNG encoder for a solid gold square
function createSimplePNG(size) {
  const { deflateSync } = require('zlib');

  // RGBA pixels: gold color
  const r = 201, g = 168, b = 76, a = 255;
  const rowBytes = size * 4 + 1; // +1 for filter byte
  const raw = Buffer.alloc(rowBytes * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // no filter
    for (let x = 0; x < size; x++) {
      const off = y * rowBytes + 1 + x * 4;
      raw[off] = r; raw[off+1] = g; raw[off+2] = b; raw[off+3] = a;
    }
  }

  const compressed = deflateSync(raw);

  // Build PNG file
  const chunks = [];

  // Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  function writeChunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcData = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4); crc.writeInt32BE(crc32(crcData));
    chunks.push(len, typeB, data, crc);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  writeChunk('IHDR', ihdr);

  // IDAT
  writeChunk('IDAT', compressed);

  // IEND
  writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat(chunks);
}

// CRC32 for PNG chunks
function crc32(buf) {
  let c = 0xffffffff;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let v = n;
    for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    table[n] = v;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) | 0;
}

// Generate icons
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180 };
for (const [name, size] of Object.entries(sizes)) {
  const buf = drawIcon(size);
  fs.writeFileSync(`public/${name}`, buf);
  console.log(`Created public/${name} (${size}x${size}, ${buf.length} bytes)`);
}
