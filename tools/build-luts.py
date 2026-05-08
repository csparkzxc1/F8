#!/usr/bin/env python3
"""
Parametric LUT generator for the F8 Seoul Filter Catalog v1.

Each film stock is modeled as a stack of color-science operations:
  1. sRGB → linear
  2. Per-channel tone curve (toe lift / contrast / shoulder rolloff)
  3. Per-channel gamma (color cast)
  4. Split-toning (highlight color + shadow color)
  5. Optional selective red boost (Camellia)
  6. Saturation
  7. Linear → sRGB

The output is a 512×512 strip PNG arranged as an 8×8 grid of 64-wide tiles,
exactly what packages/core/src/engine/shaders/lut.ts samples.

Usage:
    python tools/build-luts.py
    python tools/build-luts.py --out packages/presets-seoul/src/luts

Dependencies:
    numpy >= 1.20, Pillow >= 9
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image

TILE = 64
GRID = 8
STRIP = TILE * GRID


# ─── Color-science helpers ────────────────────────────────────────────────


def srgb_to_linear(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, np.power((c + 0.055) / 1.055, 2.4))


def linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1.0 / 2.4) - 0.055)


def luma(rgb: np.ndarray) -> np.ndarray:
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def s_curve(x: np.ndarray, contrast: float, pivot: float = 0.5) -> np.ndarray:
    return np.clip((x - pivot) * contrast + pivot, 0.0, 1.0)


def shoulder(x: np.ndarray, knee: float, strength: float) -> np.ndarray:
    over = np.maximum(0.0, x - knee)
    return x - over * strength


def toe(x: np.ndarray, lift: float, foot: float = 0.18) -> np.ndarray:
    # lift > 0: pulls shadows up; lift < 0: deepens them.
    under = np.maximum(0.0, foot - x) / max(foot, 1e-6)
    return x + under * lift


def channel_gamma(rgb: np.ndarray, r: float, g: float, b: float) -> np.ndarray:
    safe = np.clip(rgb, 1e-6, 1.0)
    out = rgb.copy()
    out[..., 0] = np.power(safe[..., 0], 1.0 / r)
    out[..., 1] = np.power(safe[..., 1], 1.0 / g)
    out[..., 2] = np.power(safe[..., 2], 1.0 / b)
    return out


def split_tone(
    rgb: np.ndarray,
    hi_color: tuple[float, float, float],
    shadow_color: tuple[float, float, float],
    strength: float,
) -> np.ndarray:
    l = luma(rgb)[..., None]
    hi_mask = np.power(l, 2.0)
    sh_mask = np.power(1.0 - l, 2.0)
    hi = np.array(hi_color, dtype=np.float32)
    sh = np.array(shadow_color, dtype=np.float32)
    out = rgb * (1.0 - strength * (hi_mask + sh_mask) * 0.5)
    out = out + hi * hi_mask * strength * 0.5
    out = out + sh * sh_mask * strength * 0.5
    return out


def saturate(rgb: np.ndarray, amount: float) -> np.ndarray:
    l = luma(rgb)[..., None]
    return l + (rgb - l) * amount


def cast(rgb: np.ndarray, dr: float, dg: float, db: float) -> np.ndarray:
    out = rgb + np.array([dr, dg, db], dtype=np.float32)
    return out


def red_boost(rgb: np.ndarray, amount: float) -> np.ndarray:
    """Boost red where it already dominates over green and blue."""
    if amount <= 1.0:
        return rgb
    red_dom = np.maximum(0.0, rgb[..., 0] - np.maximum(rgb[..., 1], rgb[..., 2]))
    out = rgb.copy()
    out[..., 0] = out[..., 0] + red_dom * (amount - 1.0)
    return out


# ─── Film recipe ──────────────────────────────────────────────────────────


@dataclass
class Recipe:
    name: str
    contrast: float = 1.0
    pivot: float = 0.5
    toe_lift: float = 0.0
    shoulder_knee: float = 0.92
    shoulder_strength: float = 0.15
    gamma: tuple[float, float, float] = (1.0, 1.0, 1.0)
    cast: tuple[float, float, float] = (0.0, 0.0, 0.0)
    hi_color: tuple[float, float, float] = (1.0, 1.0, 1.0)
    shadow_color: tuple[float, float, float] = (0.5, 0.5, 0.5)
    split_strength: float = 0.0
    red_boost: float = 1.0
    saturation: float = 1.0
    notes: str = ""


def apply_recipe(rgb: np.ndarray, r: Recipe) -> np.ndarray:
    out = srgb_to_linear(rgb)
    out = s_curve(out, r.contrast, r.pivot)
    out = toe(out, r.toe_lift)
    out = shoulder(out, r.shoulder_knee, r.shoulder_strength)
    out = channel_gamma(out, *r.gamma)
    out = split_tone(out, r.hi_color, r.shadow_color, r.split_strength)
    out = red_boost(out, r.red_boost)
    out = saturate(out, r.saturation)
    out = cast(out, *r.cast)
    out = linear_to_srgb(out)
    return out


# ─── Filter Catalog v1 — 12 recipes ───────────────────────────────────────


RECIPES: dict[str, Recipe] = {
    # ─ Free 6 ─
    "noeul": Recipe(  # 노을 — Cinestill 800T sunset
        name="노을",
        contrast=1.05,
        toe_lift=0.05,
        shoulder_knee=0.78,
        shoulder_strength=0.30,
        gamma=(1.05, 1.00, 0.92),
        cast=(0.05, 0.00, -0.04),
        hi_color=(1.00, 0.55, 0.15),
        shadow_color=(0.50, 0.35, 0.25),
        split_strength=0.30,
        saturation=1.10,
    ),
    "daybreak": Recipe(  # 새벽 — Pro 400H pulled -1, dawn cyan cast
        name="새벽",
        contrast=0.85,
        toe_lift=0.10,
        shoulder_knee=0.92,
        shoulder_strength=0.20,
        gamma=(0.95, 1.00, 1.05),
        cast=(-0.04, 0.00, 0.05),
        hi_color=(0.70, 0.85, 1.00),
        shadow_color=(0.55, 0.70, 0.90),
        split_strength=0.18,
        saturation=0.70,
    ),
    "first_snow": Recipe(  # 첫눈 — Portra 160, soft snow
        name="첫눈",
        contrast=0.95,
        toe_lift=0.02,
        shoulder_knee=0.95,
        shoulder_strength=0.10,
        gamma=(1.00, 1.00, 1.03),
        cast=(0.00, 0.00, 0.02),
        hi_color=(1.00, 1.00, 1.00),
        shadow_color=(0.70, 0.80, 0.95),
        split_strength=0.12,
        saturation=0.85,
    ),
    "childhood": Recipe(  # 유년 — Superia 200 expired, magenta shift
        name="유년",
        contrast=0.85,
        toe_lift=-0.04,
        shoulder_knee=0.85,
        shoulder_strength=0.20,
        gamma=(1.10, 0.95, 0.95),
        cast=(0.04, -0.02, -0.01),
        hi_color=(1.00, 0.95, 0.60),
        shadow_color=(0.50, 0.30, 0.50),
        split_strength=0.22,
        saturation=0.85,
    ),
    "summer_night": Recipe(  # 여름밤 — Gold 200 push +1
        name="여름밤",
        contrast=1.20,
        toe_lift=-0.02,
        shoulder_knee=0.85,
        shoulder_strength=0.30,
        gamma=(1.05, 1.00, 0.95),
        cast=(0.03, 0.00, -0.03),
        hi_color=(1.00, 0.85, 0.40),
        shadow_color=(0.30, 0.50, 0.55),
        split_strength=0.28,
        saturation=1.20,
    ),
    "holiday": Recipe(  # 휴일 — Portra 400 daily driver
        name="휴일",
        contrast=1.00,
        toe_lift=0.02,
        shoulder_knee=0.90,
        shoulder_strength=0.20,
        gamma=(1.03, 1.00, 0.98),
        cast=(0.02, 0.00, -0.01),
        hi_color=(1.00, 0.92, 0.85),
        shadow_color=(0.70, 0.65, 0.70),
        split_strength=0.13,
        saturation=1.00,
    ),
    # ─ Vintage Korea Pack ─
    "rainy_days": Recipe(  # 우기 — Ektar 100, cool sharp
        name="우기",
        contrast=1.15,
        toe_lift=-0.02,
        shoulder_knee=0.92,
        shoulder_strength=0.20,
        gamma=(0.95, 1.00, 1.05),
        cast=(-0.03, 0.00, 0.03),
        hi_color=(0.85, 0.95, 1.00),
        shadow_color=(0.40, 0.55, 0.70),
        split_strength=0.20,
        saturation=1.30,
    ),
    "caffeine": Recipe(  # 카페인 — Cinestill 50D indoor
        name="카페인",
        contrast=0.95,
        toe_lift=0.10,
        shoulder_knee=0.90,
        shoulder_strength=0.20,
        gamma=(1.08, 1.00, 0.90),
        cast=(0.05, 0.00, -0.05),
        hi_color=(1.00, 0.90, 0.70),
        shadow_color=(0.50, 0.40, 0.30),
        split_strength=0.24,
        saturation=0.90,
    ),
    "stranger": Recipe(  # 이방인 — Vision3 250D, teal-orange
        name="이방인",
        contrast=1.15,
        toe_lift=-0.05,
        shoulder_knee=0.88,
        shoulder_strength=0.25,
        gamma=(1.05, 0.97, 0.95),
        cast=(0.00, 0.00, 0.00),
        hi_color=(1.00, 0.60, 0.20),
        shadow_color=(0.20, 0.55, 0.60),
        split_strength=0.40,
        saturation=1.00,
    ),
    "soft_spring": Recipe(  # 봄날 — Pro 400H pulled -2
        name="봄날",
        contrast=0.70,
        toe_lift=0.20,
        shoulder_knee=0.85,
        shoulder_strength=0.40,
        gamma=(1.02, 1.00, 1.00),
        cast=(0.02, 0.01, 0.00),
        hi_color=(1.00, 0.92, 0.92),
        shadow_color=(0.85, 0.85, 0.95),
        split_strength=0.20,
        saturation=0.65,
    ),
    "stillness": Recipe(  # 고요 — Tri-X 400 B&W
        name="고요",
        contrast=1.05,
        toe_lift=0.06,
        shoulder_knee=0.92,
        shoulder_strength=0.20,
        gamma=(1.00, 1.00, 1.00),
        cast=(0.00, 0.00, 0.00),
        hi_color=(1.00, 1.00, 1.00),
        shadow_color=(0.95, 0.95, 1.00),
        split_strength=0.05,
        saturation=0.0,
    ),
    "camellia": Recipe(  # 동백 — Portra + selective red
        name="동백",
        contrast=1.10,
        toe_lift=-0.06,
        shoulder_knee=0.90,
        shoulder_strength=0.20,
        gamma=(1.10, 1.00, 0.97),
        cast=(0.04, -0.01, -0.02),
        hi_color=(1.00, 0.85, 0.80),
        shadow_color=(0.60, 0.40, 0.45),
        split_strength=0.18,
        red_boost=1.25,
        saturation=1.05,
    ),
}


# ─── Strip rendering ──────────────────────────────────────────────────────


def build_input_cube() -> np.ndarray:
    """64×64×64 input grid, indexed cube[r, g, b]."""
    coords = np.linspace(0.0, 1.0, TILE, dtype=np.float32)
    R, G, B = np.meshgrid(coords, coords, coords, indexing="ij")
    return np.stack([R, G, B], axis=-1)


def render_strip(recipe: Recipe, cube: np.ndarray) -> np.ndarray:
    out = apply_recipe(cube, recipe)
    out = np.clip(out, 0.0, 1.0)
    strip = np.zeros((STRIP, STRIP, 3), dtype=np.float32)
    for b_idx in range(TILE):
        col = b_idx % GRID
        row = b_idx // GRID
        # cube[r, g, b] → strip pixel (col*TILE + r, row*TILE + g) in (x, y)
        slice_ = out[:, :, b_idx, :].transpose(1, 0, 2)
        strip[row * TILE : (row + 1) * TILE, col * TILE : (col + 1) * TILE] = slice_
    return strip


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--out",
        default="packages/presets-seoul/src/luts",
        help="Output directory for strip PNGs",
    )
    args = ap.parse_args()
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    cube = build_input_cube()
    for preset_id, recipe in RECIPES.items():
        strip = render_strip(recipe, cube)
        img = Image.fromarray((strip * 255.0).round().astype(np.uint8), mode="RGB")
        path = out_dir / f"{preset_id}.png"
        img.save(path, format="PNG", optimize=True)
        print(f"  {preset_id:14s} → {path} ({recipe.name})")

    print(f"\n{len(RECIPES)} LUTs written to {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
