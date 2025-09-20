import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'sunset' | 'ocean' | 'forest' | 'sakura';

const defaultTheme: Theme = 'light';

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(defaultTheme);

  return {
    subscribe,
    setTheme: (theme: Theme) => {
      set(theme);
      if (browser) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }
    },
    initialize: () => {
      if (browser) {
        const savedTheme = localStorage.getItem('theme') as Theme;
        const initialTheme = savedTheme || defaultTheme;
        document.documentElement.setAttribute('data-theme', initialTheme);
        set(initialTheme);
      }
    }
  };
}

export const themeStore = createThemeStore();
