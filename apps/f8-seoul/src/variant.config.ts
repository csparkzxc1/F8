// F8 Seoul variant definition. All Seoul-specific copy & assets live here.
import type { VariantConfig } from '@f8/core';
import { commonPresets } from '@f8/presets-common';
import { seoulPresets, seoulPremiumPacks, seoulBodies, seoulFilms } from '@f8/presets-seoul';

const F8_SEOUL_DESCRIPTION = `F8 Seoul은 100년 전 거리 사진의 거장 Weegee가 남긴 한 마디에서 시작합니다.

"f/8 and be there." — 조리개 f/8에 맞춰놓고, 그냥 거기 있어라.

장비가 아니라 그 자리에 있는 시선이 사진을 만든다는 가르침. F8은 이 철학을 모바일로 옮긴 필름 카메라 앱입니다.

— 진짜 필름의 색
F8의 모든 프리셋은 실제 필름의 LUT(룩업 테이블)를 기반으로 만들어졌습니다. AI 합성이나 단순 톤커브가 아닌, GPU 셰이더로 처리된 진짜 필름의 색감.

기본 탑재 필름:
• Kodak Portra 400 — 따뜻한 피부톤
• Kodak Tri-X 400 — 흑백, 강한 콘트라스트
• Cinestill 800T — 텅스텐, halation
• Fuji Superia 400 — 차가운 그린, 일상
• Kodak Gold 200 — 노란빛, 햇살
• Fuji Pro 400H — 소프트 파스텔

— 카메라 바디 × 필름
Contax T2 + Portra 400. Olympus Mju + Cinestill. 좋아하는 카메라 바디와 필름을 조합해서 그 시대의 사진을 재현합니다.

— 한국의 색 (F8 Seoul 전용)
서울의 90년대부터 지금까지. 한강 야경, 서울 카페 인테리어, 거리의 일상 — 한국적 감성을 위한 6종 프리셋이 추가로 탑재됩니다.

— 감도 조정
필름 사진가의 언어로 설정합니다:
• Push/Pull (-2 ~ +2 stop)
• 노출 (-1 ~ +1 stop)
• 섀도우 / 하이라이트
• 색온도 / 틴트
• 그레인 / 라이트릭 / Halation

— 자동 보정
복잡하면 그냥 자동. F8이 사진의 노출을 분석해서 최적값을 제안합니다.

— Before/After 비교 슬라이더
길게 누르면 원본. 좌우로 드래그하면 비교.

— 무료. 그리고 정직한 IAP
기본 6종 프리셋은 무료. 영구. 더 깊이 들어가고 싶으면 프리셋팩(₩2,900~₩4,900) 단발 구매. 구독 없음.

— Variant 시리즈
F8 Tokyo, F8 Wedding, F8 Mono 등 분기마다 새로운 F8 앱이 출시됩니다.

준비됐나요?

F8. Be there.`;

export const f8SeoulConfig: VariantConfig = {
  id: 'seoul',
  appName: 'F8 Seoul',
  cityName: 'Seoul',
  bundleId: 'com.csparkzxc1.f8.seoul',
  accentColor: '#E8C39E',
  iconAssetId: 'icon-seoul',
  defaultPresets: [...commonPresets, ...seoulPresets],
  premiumPacks: seoulPremiumPacks,
  bodies: seoulBodies,
  films: seoulFilms,
  copy: {
    home: {
      title: 'F8 Seoul',
      subtitle: '서울의 빛으로.',
    },
    onboarding: [
      {
        title: 'F8.',
        body: 'Be there.',
      },
      {
        title: '100년 전, Weegee는 말했다.',
        body: '"f/8 and be there." — 조리개 f/8에 맞춰놓고, 그냥 거기 있어라.',
      },
      {
        title: '복잡한 설정 없이.',
        body: '필름을 고르고, 셔터를 누른다. 그게 전부.',
      },
    ],
    storeHero: {
      title: '한국의 색',
      description: '서울의 90년대부터 지금까지',
    },
    appStore: {
      subtitle: 'f/8 and be there.',
      keywords:
        'film,filter,camera,vintage,analog,kodak,portra,cinestill,seoul,korea,grain,lut,vsco,tezza,huji',
      description: F8_SEOUL_DESCRIPTION,
    },
  },
  iapProductIds: {
    // v1 ships only Vintage Korea. Cinematic Pack and B&W Masters land at
    // v1.5 / v2 per the Filter Catalog roadmap — register their ids in
    // App Store Connect first, then add them here.
    vintage_korea: {
      ios: 'com.csparkzxc1.f8.seoul.vintage_korea',
      android: 'vintage_korea',
    },
  },
};
