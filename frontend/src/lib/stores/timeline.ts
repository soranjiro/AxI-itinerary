import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export interface TimelineItem {
	id: string;
	itinerary_id: string;
	title: string;
	description?: string;
	location_name?: string;
	location_address?: string;
	location_lat?: number;
	location_lng?: number;
	start_datetime?: string;
	end_datetime?: string;
	budget_amount?: number;
	memo?: string;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface TimelineStore {
	items: TimelineItem[];
	isLoading: boolean;
	error: string | null;
}

const initialState: TimelineStore = {
	items: [],
	isLoading: false,
	error: null
};

export const timelineStore: Writable<TimelineStore> = writable(initialState);

export const timelineActions = {
	setLoading: (loading: boolean) => {
		timelineStore.update(state => ({ ...state, isLoading: loading }));
	},

	setError: (error: string | null) => {
		timelineStore.update(state => ({ ...state, error }));
	},

	setItems: (items: TimelineItem[]) => {
		timelineStore.update(state => ({ ...state, items }));
	},

	addItem: (item: TimelineItem) => {
		timelineStore.update(state => ({
			...state,
			items: [...state.items, item].sort((a, b) => a.sort_order - b.sort_order)
		}));
	},

	updateItem: (id: string, updates: Partial<TimelineItem>) => {
		timelineStore.update(state => ({
			...state,
			items: state.items.map(item =>
				item.id === id ? { ...item, ...updates } : item
			)
		}));
	},

	removeItem: (id: string) => {
		timelineStore.update(state => ({
			...state,
			items: state.items.filter(item => item.id !== id)
		}));
	},

	reorderItems: (items: TimelineItem[]) => {
		timelineStore.update(state => ({ ...state, items }));
	}
};
