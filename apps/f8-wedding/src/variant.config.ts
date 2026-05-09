// F8 Wedding variant — ivory accent, soft pastel skin tone for ceremonies.
import type { VariantConfig } from '@f8/core';
import { commonPresets } from '@f8/presets-common';
import { weddingPresets, weddingPremiumPacks } from '@f8/presets-wedding';

const F8_WEDDING_DESCRIPTION = `F8 Wedding은 100년 전 거리 사진의 거장 Weegee가 남긴 한 마디에서 시작합니다.

"f/8 and be there." — 조리개 f/8에 맞춰놓고, 그냥 거기 있어라.

장비가 아니라 그 자리에 있는 시선이 사진을 만든다는 가르침. F8은 이 철학을 모바일로 옮긴 필름 카메라 앱입니다.

— 결혼식의 결
F8 Wedding은 웨딩과 가족 사진을 위한 톤으로 조율되었습니다. Fuji Pro 400H의 부드러운 파스텔, Kodak Portra 800의 따뜻한 피부톤, 자연광 아래에서 가장 정직한 색.

— 진짜 필름의 색
모든 프리셋은 실제 필름의 LUT를 GPU 셰이더로 처리한 결과입니다. AI 합성이나 단순 톤커브가 아닙니다.

— 감도 조정
Push/Pull, 노출, 섀도우/하이라이트, 색온도, 틴트, 그레인, 라이트릭, halation. 필름 사진가의 언어로.

— 무료 + 정직한 IAP
기본 6종은 무료. 영구. 더 깊이 들어가고 싶으면 프리셋팩 단발 구매. 구독 없음.

F8. Be there.`;

export const f8WeddingConfig: VariantConfig = {
  id: 'wedding',
  appName: 'F8 Wedding',
  cityName: 'Wedding',
  bundleId: 'com.csparkzxc1.f8.wedding',
  accentColor: '#F5E6D3',
  iconAssetId: 'icon-wedding',
  defaultPresets: [...commonPresets, ...weddingPresets],
  premiumPacks: weddingPremiumPacks,
  copy: {
    home: {
      title: 'F8 Wedding',
      subtitle: '하루의 결을 담는다.',
    },
    onboarding: [
      { title: 'F8.', body: 'Be there.' },
      {
        title: '100년 전, Weegee는 말했다.',
        body: '"f/8 and be there." — 조리개 f/8에 맞춰놓고, 그냥 거기 있어라.',
      },
      {
        title: '그 결을 담는다.',
        body: '필름을 고르고, 셔터를 누른다. 가장 정직한 톤으로.',
      },
    ],
    storeHero: {
      title: '웨딩의 결',
      description: 'Pro 400H, Portra 800, 자연광',
    },
    appStore: {
      subtitle: 'f/8 and be there.',
      keywords:
        'film,filter,camera,wedding,bride,portra,pro400h,fuji,kodak,grain,lut,vsco,huji',
      description: F8_WEDDING_DESCRIPTION,
    },
  },
  iapProductIds: {
    bride_tones: { ios: 'com.csparkzxc1.f8.wedding.bride', android: 'bride_tones' },
    natural_light: { ios: 'com.csparkzxc1.f8.wedding.natural', android: 'natural_light' },
    family_album: { ios: 'com.csparkzxc1.f8.wedding.family', android: 'family_album' },
  },
};
