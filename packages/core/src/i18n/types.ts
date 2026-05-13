// Shared shape for all locale dictionaries. Every key must exist in every locale.
export type Dict = {
  common: {
    start: string;
    next: string;
    skip: string;
    save: string;
    cancel: string;
    retry: string;
    settings: string;
    about: string;
  };
  home: {
    shoot: string;
    pickPhoto: string;
    recent: string;
    empty: string;
  };
  editor: {
    original: string;
    f8: string;
    intensityZero: string;
    savedToast: string;
    compare: string;
    share: string;
    auto: string;
    intensity: string;
    tabs: {
      film: string;
      adjust: string;
      overlay: string;
      body: string;
    };
    overlay: {
      grain: string;
      vignette: string;
      lightLeak: string;
      halation: string;
    };
    bodyPlaceholder: string;
    placeholderSoon: string;
  };
  errors: {
    loadPhoto: string;
    saveFailed: string;
    shareFailed: string;
    permissionDenied: string;
  };
  store: {
    buy: string;
    restore: string;
  };
  // One-line poetic blurb shown under each preset name.
  presets: {
    noeul: string;
    saebyeok: string;
    cheotnun: string;
    yunyeon: string;
    yeoreumbam: string;
    hyuil: string;
    ugi: string;
    caffein: string;
    ibangin: string;
    bomnal: string;
    goyo: string;
    dongbaek: string;
  };
};
