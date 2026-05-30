// Korean copy in F8 voice: short sentences, no emoji, no exclamation hype.
import type { Dict } from './types';

export const ko: Dict = {
  common: {
    start: '시작하기',
    next: '다음',
    skip: '건너뛰기',
    save: '저장',
    cancel: '취소',
    retry: '다시 시도',
    settings: '설정',
    about: '브랜드 이야기',
  },
  home: {
    shoot: '촬영',
    pickPhoto: '사진 불러오기',
    recent: '최근',
    empty: '아직 거기 있지 않았네요.',
  },
  editor: {
    original: '원본',
    f8: 'F8',
    intensityZero: '원본 그대로',
    savedToast: '거기 있었다.',
    compare: '비교',
    share: '공유',
    auto: '자동',
    intensity: '강도',
    tabs: {
      film: '필름',
      adjust: '조정',
      overlay: '오버레이',
      body: '바디',
    },
    overlay: {
      grain: '그레인',
      vignette: '비네팅',
      lightLeak: '라이트릭',
      halation: 'Halation',
    },
    bodyPlaceholder: '곧 출시.',
    placeholderSoon: '준비 중.',
  },
  errors: {
    loadPhoto: '사진을 불러오지 못했습니다.',
    saveFailed: '저장하지 못했습니다.',
    shareFailed: '공유하지 못했습니다.',
    permissionDenied: '사진 권한이 필요합니다.',
  },
  store: {
    buy: '구매',
    restore: '구매 복원',
  },
  about: {
    trademarks:
      '본 앱에 언급된 카메라와 필름 이름은 각 제조사의 상표이며, F8은 해당 회사들과 제휴 관계가 없습니다. 이름 사용은 시각적 영감의 출처를 설명하기 위한 지칭적 사용입니다.',
  },
  presets: {
    noeul: '마지막 빛.',
    saebyeok: '아직 푸르다.',
    cheotnun: '조용히 내린다.',
    yunyeon: '잊어도 남는다.',
    yeoreumbam: '끝나지 않을 것 같은.',
    hyuil: '그냥 좋다.',
    ugi: '선명하게 젖었다.',
    caffein: '오래 머무를 것.',
    ibangin: '지나간 사람.',
    bomnal: '흩날리는.',
    goyo: '말없이 있다.',
    dongbaek: '붉게 핀다.',
  },
};
