// F8 Tokyo variant — neon pink accent, Shibuya / late-night street tone.
import type { VariantConfig } from '@f8/core';
import { commonPresets } from '@f8/presets-common';
import { tokyoPresets, tokyoPremiumPacks } from '@f8/presets-tokyo';

const F8_TOKYO_DESCRIPTION = `F8 Tokyoは、100年前のストリート写真の巨匠 Weegee の言葉から始まります。

"f/8 and be there." — 絞りは f/8、そしてその場にいろ。

機材ではなく、その場に立つ視線が写真を作る。F8 はこの哲学をモバイルに移したフィルムカメラアプリです。

— 本物のフィルムの色
F8 のすべてのプリセットは、実フィルムの LUT(ルックアップテーブル)に基づいています。AI 合成や単純なトーンカーブではなく、GPU シェーダーで処理された本物のフィルムの色味。

— 渋谷の夜のために
ネオン、雨、駅前のスクランブル。F8 Tokyo は東京の夜の色のために調律された 6 種のプリセットを追加で搭載します。

— 感度調整
プッシュ/プル、露出、シャドウ/ハイライト、色温度、ティント、グレイン、ライトリーク、ハレーション。フィルム写真家の言葉で。

— 無料 + 正直な IAP
基本 6 種は無料、永久。さらにいきたい人にはプリセットパックの単発購入。サブスクなし。

F8. Be there.`;

export const f8TokyoConfig: VariantConfig = {
  id: 'tokyo',
  appName: 'F8 Tokyo',
  bundleId: 'com.csparkzxc1.f8.tokyo',
  accentColor: '#FF6B9D',
  iconAssetId: 'icon-tokyo',
  defaultPresets: [...commonPresets, ...tokyoPresets],
  premiumPacks: tokyoPremiumPacks,
  copy: {
    home: {
      title: 'F8 Tokyo',
      subtitle: '夜の光で。',
    },
    onboarding: [
      { title: 'F8.', body: 'Be there.' },
      {
        title: '100年前、Weegee は言った。',
        body: '"f/8 and be there." — 絞りは f/8、そしてその場にいろ。',
      },
      {
        title: '設定はいらない。',
        body: 'フィルムを選び、シャッターを切る。それだけ。',
      },
    ],
    storeHero: {
      title: '東京の夜',
      description: 'ネオン、雨、夜の街角',
    },
    appStore: {
      subtitle: 'f/8 and be there.',
      keywords:
        'film,filter,camera,vintage,analog,kodak,cinestill,tokyo,shibuya,neon,grain,lut,vsco,huji',
      description: F8_TOKYO_DESCRIPTION,
    },
  },
  iapProductIds: {
    neon_night: { ios: 'com.csparkzxc1.f8.tokyo.neon', android: 'neon_night' },
    rainy_streets: { ios: 'com.csparkzxc1.f8.tokyo.rain', android: 'rainy_streets' },
    shibuya_glow: { ios: 'com.csparkzxc1.f8.tokyo.shibuya', android: 'shibuya_glow' },
  },
};
