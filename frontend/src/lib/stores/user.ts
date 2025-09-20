import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
	id: string;
	email: string;
	name: string | null;
}

function createUserStore() {
	const { subscribe, set, update } = writable<User | null>(null);

	// Initialize from cookie if in browser
	if (browser) {
		try {
			const userCookie = document.cookie
				.split('; ')
				.find(row => row.startsWith('user='));
			if (userCookie) {
				const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
				set(userData);
			}
		} catch (e) {
			// Invalid cookie
		}
	}

	return {
		subscribe,
		set,
		update,
		login: (user: User) => set(user),
		logout: () => {
			set(null);
			// Clear cookies
			document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		}
	};
}

export const user = createUserStore();
