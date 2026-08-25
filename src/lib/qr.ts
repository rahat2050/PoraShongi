/**
 * Minimal, dependency-free QR Code encoder (byte mode, ECC level M).
 *
 * কেন নিজে লিখলাম: আমাদের CSP কঠোর, আর তৃতীয় পক্ষের QR API ব্যবহার করলে
 * ব্যবহারকারীর ব্রাউজার বাইরের সার্ভারে request পাঠাত (privacy + uptime ঝুঁকি)।
 * এটি build/render-time-এ চলে এবং শুধু একটি SVG path string দেয়।
 *
 * সীমা: byte mode, version 1–6 (১০৬ বাইট পর্যন্ত) — একটি URL-এর জন্য যথেষ্ট।
 * Reference: ISO/IEC 18004.
 */

// --- Galois field (GF(256)) arithmetic for Reed-Solomon --------------------
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Uint8Array(ecLen);
  for (const byte of data) {
    const factor = byte ^ res[0];
    res.copyWithin(0, 1);
    res[ecLen - 1] = 0;
    if (factor !== 0) {
      for (let i = 0; i < ecLen; i++) res[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return res;
}

// --- Version tables (ECC level M only) -------------------------------------
/** [totalCodewords, ecCodewordsPerBlock, group1Blocks, group2Blocks] */
const MAX_VERSION = 6;

const VERSION_M: Array<[number, number, number, number]> = [
  [26, 10, 1, 0], // v1
  [44, 16, 1, 0], // v2
  [70, 26, 1, 0], // v3
  [100, 18, 2, 0], // v4
  [134, 24, 2, 0], // v5
  [172, 16, 4, 0], // v6
  [196, 18, 4, 0], // v7
  [242, 22, 2, 2], // v8
  [292, 22, 3, 2], // v9
  [346, 26, 4, 1], // v10
];

const ALIGNMENT: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

function capacityBytes(version: number): number {
  const [total, ecPerBlock, g1, g2] = VERSION_M[version - 1];
  const blocks = g1 + g2;
  const dataCodewords = total - ecPerBlock * blocks;
  // Overhead = 4-bit mode indicator + character-count field, rounded up to
  // whole codewords: (4 + 8) bits = 2 bytes for versions 1-9.
  const lenBits = version < 10 ? 8 : 16;
  return dataCodewords - Math.ceil((4 + lenBits) / 8);
}

// --- Bit buffer -------------------------------------------------------------
class BitBuffer {
  bits: number[] = [];
  put(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
  }
}

// --- Matrix helpers ---------------------------------------------------------
type Grid = Int8Array[]; // -1 = free, 0/1 = module

function newGrid(size: number): Grid {
  return Array.from({ length: size }, () => new Int8Array(size).fill(-1));
}

function placeFinder(grid: Grid, row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || cc < 0 || rr >= grid.length || cc >= grid.length) continue;
      const inRing = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6));
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[rr][cc] = inRing || inCore ? 1 : 0;
    }
  }
}

function placeFunctionPatterns(grid: Grid, version: number) {
  const size = grid.length;
  placeFinder(grid, 0, 0);
  placeFinder(grid, 0, size - 7);
  placeFinder(grid, size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const bit = i % 2 === 0 ? 1 : 0;
    if (grid[6][i] === -1) grid[6][i] = bit;
    if (grid[i][6] === -1) grid[i][6] = bit;
  }

  // Alignment patterns
  const centres = ALIGNMENT[version];
  for (const r of centres) {
    for (const c of centres) {
      // Skip the three finder corners
      if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const ring = Math.max(Math.abs(dr), Math.abs(dc));
          grid[r + dr][c + dc] = ring === 1 ? 0 : 1;
        }
      }
    }
  }

  // Dark module
  grid[size - 8][8] = 1;

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === -1) grid[8][i] = 0;
    if (grid[i][8] === -1) grid[i][8] = 0;
  }
  for (let i = 0; i < 8; i++) {
    if (grid[8][size - 1 - i] === -1) grid[8][size - 1 - i] = 0;
    if (grid[size - 1 - i][8] === -1) grid[size - 1 - i][8] = 0;
  }
}

/** Function-pattern mask so data placement skips reserved modules. */
function functionMask(version: number, size: number): boolean[][] {
  const probe = newGrid(size);
  placeFunctionPatterns(probe, version);
  return probe.map((row) => Array.from(row, (cell) => cell !== -1));
}

function maskBit(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0: return (row + col) % 2 === 0;
    case 1: return row % 2 === 0;
    case 2: return col % 3 === 0;
    case 3: return (row + col) % 3 === 0;
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    default: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

/** BCH(15,5) format information for ECC level M. */
function formatBits(mask: number): number {
  const data = (0b00 << 3) | mask; // 0b00 = ECC level M
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function penalty(grid: Grid): number {
  const size = grid.length;
  let score = 0;

  // Rule 1: runs of 5+ same-colour modules
  for (let i = 0; i < size; i++) {
    for (const horizontal of [true, false]) {
      let run = 1;
      for (let j = 1; j < size; j++) {
        const cur = horizontal ? grid[i][j] : grid[j][i];
        const prev = horizontal ? grid[i][j - 1] : grid[j - 1][i];
        if (cur === prev) {
          run++;
        } else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
        }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
  }

  // Rule 2: 2x2 blocks of the same colour
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
    }
  }

  // Rule 3: finder-like 1:1:3:1:1 patterns
  const pattern = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const reversed = [...pattern].reverse();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j + 11 <= size; j++) {
      const rowSeq: number[] = [];
      const colSeq: number[] = [];
      for (let k = 0; k < 11; k++) {
        rowSeq.push(grid[i][j + k]);
        colSeq.push(grid[j + k][i]);
      }
      for (const seq of [rowSeq, colSeq]) {
        if (pattern.every((p, k) => p === seq[k]) || reversed.every((p, k) => p === seq[k])) score += 40;
      }
    }
  }

  // Rule 4: overall dark/light balance
  let dark = 0;
  for (const row of grid) for (const cell of row) if (cell === 1) dark++;
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

/**
 * Encode `text` and return the QR modules as a boolean matrix.
 * Throws when the text does not fit in version 10 at ECC level M.
 */
export function encodeQr(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);

  // Versions 7+ also require an 18-bit version information block, which this
  // encoder intentionally does not implement. Version 6 already holds 106
  // bytes at ECC M — far more than any URL we encode.
  let version = 0;
  for (let v = 1; v <= MAX_VERSION; v++) {
    if (bytes.length <= capacityBytes(v)) {
      version = v;
      break;
    }
  }
  if (version === 0) {
    throw new Error(`QR payload too long: max ${capacityBytes(MAX_VERSION)} bytes at ECC M.`);
  }

  const [totalCodewords, ecPerBlock, g1Blocks, g2Blocks] = VERSION_M[version - 1];
  const blocks = g1Blocks + g2Blocks;
  const dataCodewords = totalCodewords - ecPerBlock * blocks;
  const g1Len = Math.floor(dataCodewords / blocks);
  const g2Len = g1Len + 1;

  // --- Build the bit stream -------------------------------------------------
  const bb = new BitBuffer();
  bb.put(0b0100, 4); // byte mode
  bb.put(bytes.length, version < 10 ? 8 : 16);
  for (const byte of bytes) bb.put(byte, 8);

  const capacityBits = dataCodewords * 8;
  bb.put(0, Math.min(4, capacityBits - bb.bits.length)); // terminator
  while (bb.bits.length % 8 !== 0) bb.bits.push(0);

  const data = new Uint8Array(dataCodewords);
  for (let i = 0; i < bb.bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bb.bits[i + b];
    data[i / 8] = byte;
  }
  // Pad with the standard alternating bytes
  const padBytes = [0xec, 0x11];
  for (let i = bb.bits.length / 8, p = 0; i < dataCodewords; i++, p++) {
    data[i] = padBytes[p % 2];
  }

  // --- Split into blocks and compute error correction -----------------------
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  for (let b = 0; b < blocks; b++) {
    const len = b < g1Blocks ? g1Len : g2Len;
    const block = data.slice(offset, offset + len);
    offset += len;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  // Interleave
  const finalBytes: number[] = [];
  for (let i = 0; i < g2Len; i++) {
    for (const block of dataBlocks) if (i < block.length) finalBytes.push(block[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) finalBytes.push(block[i]);
  }

  // --- Place modules --------------------------------------------------------
  const size = version * 4 + 17;
  const reserved = functionMask(version, size);
  const grid = newGrid(size);
  placeFunctionPatterns(grid, version);

  let bitIndex = 0;
  const totalBits = finalBytes.length * 8;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // skip the vertical timing column
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (reserved[row][cc]) continue;
        let bit = 0;
        if (bitIndex < totalBits) {
          bit = (finalBytes[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1;
          bitIndex++;
        }
        grid[row][cc] = bit;
      }
    }
    upward = !upward;
  }

  // --- Choose the lowest-penalty mask --------------------------------------
  let best: Grid | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const candidate = grid.map((row) => Int8Array.from(row));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!reserved[r][c] && maskBit(mask, r, c)) candidate[r][c] ^= 1;
      }
    }

    // Write format information for this mask
    const fmt = formatBits(mask);
    for (let i = 0; i < 15; i++) {
      // Format bits are placed most-significant-bit first (ISO/IEC 18004 §8.9).
      const bit = (fmt >>> (14 - i)) & 1;
      // Top-left
      if (i < 6) candidate[8][i] = bit;
      else if (i === 6) candidate[8][7] = bit;
      else if (i === 7) candidate[8][8] = bit;
      else if (i === 8) candidate[7][8] = bit;
      else candidate[14 - i][8] = bit;
      // Duplicate copy: bits 0-6 climb the bottom-left column, bits 7-14 run
      // along row 8 on the right. Bit 7 sits at (8, size-8) — NOT at
      // (size-8, 8), which is the reserved dark module.
      if (i < 7) candidate[size - 1 - i][8] = bit;
      else candidate[8][size - 15 + i] = bit;
    }
    candidate[size - 8][8] = 1; // dark module stays set

    const score = penalty(candidate);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best!.map((row) => Array.from(row, (cell) => cell === 1));
}

/**
 * Render `text` as a single SVG path `d` attribute plus the module count.
 * One path keeps the DOM tiny even for a 57x57 grid.
 */
export function qrSvgPath(text: string): { d: string; size: number } {
  const modules = encodeQr(text);
  const parts: string[] = [];
  modules.forEach((row, r) => {
    row.forEach((on, c) => {
      if (on) parts.push(`M${c} ${r}h1v1h-1z`);
    });
  });
  return { d: parts.join(""), size: modules.length };
}
