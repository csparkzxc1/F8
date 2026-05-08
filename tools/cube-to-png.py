#!/usr/bin/env python3
"""
Convert .cube LUT files into the strip-PNG format that F8's lut.sksl shader
samples from. The shader expects an 8x8 grid of 64-wide tiles (512x512 total),
with the blue axis stepping across cells.

Usage:
    python tools/cube-to-png.py input.cube output.png
    python tools/cube-to-png.py luts/noeul.cube packages/presets-seoul/src/luts/noeul.png

Batch:
    for f in luts/*.cube; do
        name=$(basename "$f" .cube)
        python tools/cube-to-png.py "$f" "packages/presets-seoul/src/luts/$name.png"
    done

Dependencies:
    pip install numpy pillow

Notes:
    - The shader hard-codes 8x8 tiles of 64px each (TILE=64, GRID=8 in lut.sksl).
      A 17- or 33-step .cube is upsampled by trilinear interpolation onto the
      64-step grid the shader expects.
    - Blue index advances across the grid: cell (col, row) for blue index b is
      (b % 8, b // 8). Inside each cell, x is red, y is green.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

TILE = 64
GRID = 8
STRIP = TILE * GRID  # 512


def parse_cube(path: Path) -> tuple[int, np.ndarray]:
    """Return (input_size, lut_grid) where lut_grid is shape (size, size, size, 3)."""
    size = 33
    samples: list[list[float]] = []
    with path.open() as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if line.upper().startswith("LUT_3D_SIZE"):
                size = int(line.split()[-1])
                continue
            parts = line.split()
            if len(parts) == 3:
                try:
                    samples.append([float(parts[0]), float(parts[1]), float(parts[2])])
                except ValueError:
                    continue

    expected = size ** 3
    if len(samples) != expected:
        raise ValueError(
            f"{path}: expected {expected} entries for LUT_3D_SIZE {size}, "
            f"got {len(samples)}"
        )

    arr = np.array(samples, dtype=np.float32)
    # .cube convention: red varies fastest, then green, then blue.
    grid = arr.reshape(size, size, size, 3, order="F")
    return size, grid


def trilinear(grid: np.ndarray, r: float, g: float, b: float) -> np.ndarray:
    """Sample the LUT at normalized [0, 1] coordinates."""
    size = grid.shape[0]
    last = size - 1

    rf = r * last
    gf = g * last
    bf = b * last
    r0, g0, b0 = int(rf), int(gf), int(bf)
    r1 = min(r0 + 1, last)
    g1 = min(g0 + 1, last)
    b1 = min(b0 + 1, last)
    rd = rf - r0
    gd = gf - g0
    bd = bf - b0

    c000 = grid[r0, g0, b0]
    c100 = grid[r1, g0, b0]
    c010 = grid[r0, g1, b0]
    c110 = grid[r1, g1, b0]
    c001 = grid[r0, g0, b1]
    c101 = grid[r1, g0, b1]
    c011 = grid[r0, g1, b1]
    c111 = grid[r1, g1, b1]

    c00 = c000 * (1 - rd) + c100 * rd
    c10 = c010 * (1 - rd) + c110 * rd
    c01 = c001 * (1 - rd) + c101 * rd
    c11 = c011 * (1 - rd) + c111 * rd

    c0 = c00 * (1 - gd) + c10 * gd
    c1 = c01 * (1 - gd) + c11 * gd

    return c0 * (1 - bd) + c1 * bd


def build_strip(grid: np.ndarray) -> np.ndarray:
    """Render the 512x512 strip the shader expects."""
    out = np.zeros((STRIP, STRIP, 3), dtype=np.float32)
    for b_idx in range(TILE):
        cell_col = b_idx % GRID
        cell_row = b_idx // GRID
        b = b_idx / (TILE - 1)
        for g_idx in range(TILE):
            g = g_idx / (TILE - 1)
            for r_idx in range(TILE):
                r = r_idx / (TILE - 1)
                px = trilinear(grid, r, g, b)
                y = cell_row * TILE + g_idx
                x = cell_col * TILE + r_idx
                out[y, x] = px
    return np.clip(out, 0.0, 1.0)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 1
    in_path = Path(argv[1])
    out_path = Path(argv[2])
    if not in_path.exists():
        print(f"input not found: {in_path}", file=sys.stderr)
        return 1

    size, grid = parse_cube(in_path)
    strip = build_strip(grid)
    img = Image.fromarray((strip * 255).round().astype(np.uint8), mode="RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, format="PNG", optimize=True)
    print(f"{in_path} (size {size}) → {out_path} ({STRIP}x{STRIP})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
