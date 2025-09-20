import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export interface Itinerary {
	id: string;
	title: string;
	description?: string;
	theme: string;
	created_at: string;
	updated_at: string;
}

export interface ItineraryStore {
	current: Itinerary | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: ItineraryStore = {
	current: null,
	isLoading: false,
	error: null
};

export const itineraryStore: Writable<ItineraryStore> = writable(initialState);

export const itineraryActions = {
	setLoading: (loading: boolean) => {
		itineraryStore.update(state => ({ ...state, isLoading: loading }));
	},

	setError: (error: string | null) => {
		itineraryStore.update(state => ({ ...state, error }));
	},

	setCurrent: (itinerary: Itinerary | null) => {
		itineraryStore.update(state => ({ ...state, current: itinerary }));
	},

	updateCurrent: (updates: Partial<Itinerary>) => {
		itineraryStore.update(state => ({
			...state,
			current: state.current ? { ...state.current, ...updates } : null
		}));
	}
};
