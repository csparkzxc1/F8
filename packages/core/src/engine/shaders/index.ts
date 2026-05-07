// Lazy compile each RuntimeEffect once per process. Skia must be loaded first.
import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia';
import { LUT_SHADER } from './lut';
import { ADJUSTMENTS_SHADER } from './adjustments';
import { GRAIN_SHADER } from './grain';
import { LIGHTLEAK_SHADER } from './lightleak';

let _lut: SkRuntimeEffect | null = null;
let _adj: SkRuntimeEffect | null = null;
let _grain: SkRuntimeEffect | null = null;
let _leak: SkRuntimeEffect | null = null;

function compile(name: string, source: string): SkRuntimeEffect {
  const eff = Skia.RuntimeEffect.Make(source);
  if (!eff) {
    throw new Error(`F8: failed to compile shader "${name}"`);
  }
  return eff;
}

export function getLutEffect(): SkRuntimeEffect {
  return (_lut ??= compile('lut', LUT_SHADER));
}

export function getAdjustmentsEffect(): SkRuntimeEffect {
  return (_adj ??= compile('adjustments', ADJUSTMENTS_SHADER));
}

export function getGrainEffect(): SkRuntimeEffect {
  return (_grain ??= compile('grain', GRAIN_SHADER));
}

export function getLightleakEffect(): SkRuntimeEffect {
  return (_leak ??= compile('lightleak', LIGHTLEAK_SHADER));
}

export { LUT_SHADER, ADJUSTMENTS_SHADER, GRAIN_SHADER, LIGHTLEAK_SHADER };
