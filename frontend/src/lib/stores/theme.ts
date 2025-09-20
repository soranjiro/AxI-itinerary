import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme =
  | 'light'
  | 'dark'
  | 'seaside'
  | 'auto'
  | 'itinerary-travel'
  | 'itinerary-business'
  | 'itinerary-minimalist'
  | 'itinerary-nature'
  | 'itinerary-sakura'
  | 'itinerary-ocean'
  | 'itinerary-mountain'
  | 'itinerary-city';

const THEME_KEY = 'axi-itinerary-theme';

// システムのテーマを取得
const getSystemTheme = (): 'light' | 'dark' => {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 現在のテーマを取得
const getCurrentTheme = (): Theme => {
	if (!browser) return 'auto';

	const stored = localStorage.getItem(THEME_KEY);
	const validThemes: Theme[] = [
		'light', 'dark', 'seaside', 'auto',
		'itinerary-travel', 'itinerary-business', 'itinerary-minimalist',
		'itinerary-nature', 'itinerary-sakura', 'itinerary-ocean',
		'itinerary-mountain', 'itinerary-city'
	];

	if (stored && validThemes.includes(stored as Theme)) {
		return stored as Theme;
	}
	return 'auto';
};

// 実際の適用テーマを取得
const getAppliedTheme = (theme: Theme): Theme => {
	if (theme === 'auto') {
		return getSystemTheme();
	}
	return theme;
};

// テーマストアの作成
const createThemeStore = () => {
	const { subscribe, set, update } = writable<Theme>(getCurrentTheme());

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem(THEME_KEY, theme);
			}
			set(theme);
			updateAppliedTheme(theme);
		},
		getAppliedTheme: () => {
			let currentTheme: Theme;
			subscribe((theme) => currentTheme = theme)();
			return getAppliedTheme(currentTheme!);
		}
	};
};

export const theme = createThemeStore();

// 実際のテーマ適用関数
const updateAppliedTheme = (theme: Theme) => {
	if (!browser) return;

	const appliedTheme = getAppliedTheme(theme);
	const root = document.documentElement;

	// 全てのテーマクラスを削除
	const allThemeClasses = [
		'dark', 'seaside', 'itinerary-travel', 'itinerary-business',
		'itinerary-minimalist', 'itinerary-nature', 'itinerary-sakura',
		'itinerary-ocean', 'itinerary-mountain', 'itinerary-city'
	];
	root.classList.remove(...allThemeClasses);

	// 適用するテーマに応じてクラスを追加
	if (appliedTheme !== 'light' && appliedTheme !== 'auto') {
		root.classList.add(appliedTheme);
	}
	// lightテーマはクラスなし（デフォルト）
};

// 初期化時にテーマを適用
if (browser) {
	updateAppliedTheme(getCurrentTheme());

	// システムテーマの変更を監視
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		const currentTheme = getCurrentTheme();
		if (currentTheme === 'auto') {
			updateAppliedTheme(currentTheme);
		}
	});
}
