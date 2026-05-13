// English copy in F8 voice. Mirror of ko.ts.
import type { Dict } from './types';

export const en: Dict = {
  common: {
    start: 'Start',
    next: 'Next',
    skip: 'Skip',
    save: 'Save',
    cancel: 'Cancel',
    retry: 'Retry',
    settings: 'Settings',
    about: 'About',
  },
  home: {
    shoot: 'Shoot',
    pickPhoto: 'Pick a photo',
    recent: 'Recent',
    empty: "You haven't been there yet.",
  },
  editor: {
    original: 'Original',
    f8: 'F8',
    intensityZero: 'As shot',
    savedToast: 'You were there.',
    compare: 'Compare',
    share: 'Share',
    auto: 'Auto',
    intensity: 'Intensity',
    tabs: {
      film: 'Film',
      adjust: 'Adjust',
      overlay: 'Overlay',
      body: 'Body',
    },
    overlay: {
      grain: 'Grain',
      vignette: 'Vignette',
      lightLeak: 'Light leak',
      halation: 'Halation',
    },
    bodyPlaceholder: 'Coming soon.',
    placeholderSoon: 'Coming soon.',
  },
  errors: {
    loadPhoto: "Couldn't load the photo.",
    saveFailed: "Couldn't save.",
    shareFailed: "Couldn't share.",
    permissionDenied: 'Photo access is required.',
  },
  store: {
    buy: 'Buy',
    restore: 'Restore purchases',
  },
  presets: {
    noeul: 'The last light.',
    saebyeok: 'Still blue.',
    cheotnun: 'Quietly falling.',
    yunyeon: 'Stays even when forgotten.',
    yeoreumbam: 'Like it never ends.',
    hyuil: 'Simply good.',
    ugi: 'Sharply wet.',
    caffein: 'A long stay.',
    ibangin: 'Someone who passed.',
    bomnal: 'Drifting.',
    goyo: 'Without a word.',
    dongbaek: 'Blooming red.',
  },
};
