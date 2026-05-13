#!/usr/bin/env -S npx tsx
/**
 * Dummy LUT generator for development. Produces 12 tinted-identity LUT PNGs
 * that match the F8 LUT shader's expected layout (512×512 strip, 8×8 grid
 * of 64-wide blue slices — see packages/core/src/engine/shaders/lut.ts).
 *
 * Why 512×512 and not the 64×64 the brief asks for: the runtime LUT shader
 * samples a 512×512 strip, so a 64×64 PNG would render incorrectly. Each
 * output here is an identity LUT lerp'd 50% toward the film's dominant hue
 * so previews show a visible tint without losing the underlying image.
 *
 * The real parametric LUTs (tools/build-luts.py) replace these when ready.
 *
 * Usage:
 *   npx tsx tools/generate-dummy-luts.ts
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const TILE = 64;
const GRID = 8;
const STRIP = TILE * GRID; // 512
const TINT_STRENGTH = 0.5;

type DummySpec = {
  id: string;
  // #RRGGBB
  hex: string;
  // Destination relative to repo root.
  out: string;
};

const ROOT = resolve(__dirname, '..');
const COMMON = 'packages/presets-common/src/luts';
const SEOUL = 'packages/presets-seoul/src/luts';

const SPECS: DummySpec[] = [
  // Free 6 — packages/presets-common
  { id: 'noeul',      hex: '#d4a574', out: `${COMMON}/noeul.png` },
  { id: 'saebyeok',   hex: '#88a8c0', out: `${COMMON}/saebyeok.png` },
  { id: 'cheotnun',   hex: '#e0e8f0', out: `${COMMON}/cheotnun.png` },
  { id: 'yunyeon',    hex: '#c8a87a', out: `${COMMON}/yunyeon.png` },
  { id: 'yeoreumbam', hex: '#e8a060', out: `${COMMON}/yeoreumbam.png` },
  { id: 'hyuil',      hex: '#d4b08c', out: `${COMMON}/hyuil.png` },
  // Premium 6 (Vintage Korea) — packages/presets-seoul
  { id: 'ugi',        hex: '#4a6878', out: `${SEOUL}/ugi.png` },
  { id: 'caffein',    hex: '#8a6038', out: `${SEOUL}/caffein.png` },
  { id: 'ibangin',    hex: '#6890a0', out: `${SEOUL}/ibangin.png` },
  { id: 'bomnal',     hex: '#e0c8c0', out: `${SEOUL}/bomnal.png` },
  { id: 'goyo',       hex: '#888888', out: `${SEOUL}/goyo.png` },
  { id: 'dongbaek',   hex: '#b85838', out: `${SEOUL}/dongbaek.png` },
];

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace('#', '');
  return [
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  ];
}

// Build a 512×512 RGB buffer: identity LUT lerp'd toward `tint`.
function buildLut(tintHex: string): Buffer {
  const [tr, tg, tb] = hexToRgb(tintHex);
  const buf = Buffer.alloc(STRIP * STRIP * 3);
  for (let y = 0; y < STRIP; y++) {
    const cellY = Math.floor(y / TILE);
    const innerY = y % TILE;
    const g = innerY / (TILE - 1);
    for (let x = 0; x < STRIP; x++) {
      const cellX = Math.floor(x / TILE);
      const innerX = x % TILE;
      const r = innerX / (TILE - 1);
      const blueIndex = cellY * GRID + cellX;
      const b = blueIndex / (TILE - 1);
      const or = r * (1 - TINT_STRENGTH) + tr * TINT_STRENGTH;
      const og = g * (1 - TINT_STRENGTH) + tg * TINT_STRENGTH;
      const ob = b * (1 - TINT_STRENGTH) + tb * TINT_STRENGTH;
      const i = (y * STRIP + x) * 3;
      buf[i] = Math.round(or * 255);
      buf[i + 1] = Math.round(og * 255);
      buf[i + 2] = Math.round(ob * 255);
    }
  }
  return buf;
}

// Minimal PNG encoder for RGB 8-bit. Spec: https://www.w3.org/TR/PNG/.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const tBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tBuf, data])), 0);
  return Buffer.concat([len, tBuf, data, crc]);
}

function encodePng(rgb: Buffer, width: number, height: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  // Filter byte (0 = None) prepended to each scanline.
  const stride = width * 3;
  const filtered = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    rgb.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(filtered, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function main(): void {
  for (const spec of SPECS) {
    const dest = join(ROOT, spec.out);
    mkdirSync(dirname(dest), { recursive: true });
    const rgb = buildLut(spec.hex);
    const png = encodePng(rgb, STRIP, STRIP);
    writeFileSync(dest, png);
    // eslint-disable-next-line no-console
    console.log(`wrote ${spec.out} (${spec.hex})`);
  }
}

main();
