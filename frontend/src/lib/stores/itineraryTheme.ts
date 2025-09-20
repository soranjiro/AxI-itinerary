import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ItineraryTheme = 'travel' | 'business' | 'minimalist' | 'nature' | 'sakura' | 'ocean' | 'mountain' | 'city';

// 許可するテーマ一覧（ランタイム検証用）
const ALLOWED_THEMES: ItineraryTheme[] = [
  'travel',
  'business',
  'minimalist',
  'nature',
  'sakura',
  'ocean',
  'mountain',
  'city'
];

function toSafeTheme(theme: unknown): ItineraryTheme {
  return (typeof theme === 'string' && (ALLOWED_THEMES as readonly string[]).includes(theme))
    ? (theme as ItineraryTheme)
    : 'travel';
}

// しおりテーマの設定を管理
const createItineraryThemeStore = () => {
  const { subscribe, set } = writable<ItineraryTheme>('travel');

  return {
    subscribe,
    set: (theme: ItineraryTheme | string) => {
      const safe = toSafeTheme(theme);
      if (browser) {
        // HTMLのclass属性にしおりテーマを適用
        const root = document.documentElement;
        // 既存のしおりテーマクラスを削除
        root.classList.remove(
          'itinerary-travel',
          'itinerary-business',
          'itinerary-minimalist',
          'itinerary-nature',
          'itinerary-sakura',
          'itinerary-ocean',
          'itinerary-mountain',
          'itinerary-city'
        );
        // 新しいテーマクラスを追加
        root.classList.add(`itinerary-${safe}`);
      }
      set(safe);
    },
    init: (theme: ItineraryTheme | string = 'travel') => {
      const safe = toSafeTheme(theme);
      if (browser) {
        const root = document.documentElement;
        root.classList.remove(
          'itinerary-travel',
          'itinerary-business',
          'itinerary-minimalist',
          'itinerary-nature',
          'itinerary-sakura',
          'itinerary-ocean',
          'itinerary-mountain',
          'itinerary-city'
        );
        root.classList.add(`itinerary-${safe}`);
      }
      set(safe);
    }
  };
};

export const itineraryTheme = createItineraryThemeStore();

// しおりテーマの詳細情報
export const itineraryThemes = {
  travel: {
    name: '旅行',
    description: '明るく活動的な旅行テーマ',
    icon: '✈️',
    primaryColor: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500'
  },
  business: {
    name: 'ビジネス',
    description: '洗練されたビジネステーマ',
    icon: '💼',
    primaryColor: '#475569',
    gradient: 'from-slate-600 to-slate-800'
  },
  minimalist: {
    name: 'ミニマル',
    description: 'シンプルで清潔なテーマ',
    icon: '⚪',
    primaryColor: '#171717',
    gradient: 'from-neutral-900 to-neutral-700'
  },
  nature: {
    name: 'ナチュラル',
    description: '自然をイメージした緑のテーマ',
    icon: '🌿',
    primaryColor: '#22c55e',
    gradient: 'from-green-500 to-emerald-600'
  },
  sakura: {
    name: '桜',
    description: '春と桜をイメージしたピンクテーマ',
    icon: '🌸',
    primaryColor: '#ec4899',
    gradient: 'from-pink-500 to-rose-500'
  },
  ocean: {
    name: '海',
    description: '海と夏をイメージしたブルーテーマ',
    icon: '🌊',
    primaryColor: '#0ea5e9',
    gradient: 'from-sky-500 to-cyan-500'
  },
  mountain: {
    name: '山',
    description: '山と秋をイメージしたアースカラー',
    icon: '⛰️',
    primaryColor: '#a16207',
    gradient: 'from-amber-600 to-orange-700'
  },
  city: {
    name: '都市',
    description: 'モダンな都市をイメージしたテーマ',
    icon: '🏙️',
    primaryColor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600'
  }
} as const;
