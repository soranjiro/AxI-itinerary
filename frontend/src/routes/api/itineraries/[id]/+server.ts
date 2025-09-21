import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		const { id } = params;

		if (!id) {
			throw error(400, 'ID is required');
		}

		let itinerary = null;
		let timelineItems = [];
		let packingItems = [];
		let budgetItems = [];

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			// Get itinerary
			const itineraryResult = await db.prepare(`
				SELECT * FROM itineraries WHERE id = ?
			`).bind(id).first();

			if (!itineraryResult) {
				throw error(404, 'Itinerary not found');
			}

			itinerary = itineraryResult;

			// Get timeline items
			const timelineResult = await db.prepare(`
				SELECT * FROM timeline_items WHERE itinerary_id = ? ORDER BY sort_order
			`).bind(id).all();
			timelineItems = timelineResult.results || [];

			// Get packing items
			const packingResult = await db.prepare(`
				SELECT * FROM packing_items WHERE itinerary_id = ? ORDER BY category, item_name
			`).bind(id).all();
			packingItems = packingResult.results || [];

			// Get budget items
			const budgetResult = await db.prepare(`
				SELECT * FROM budget_items WHERE itinerary_id = ? ORDER BY category, item_name
			`).bind(id).all();
			budgetItems = budgetResult.results || [];
		} else {
			// D1 database not available: return mock data for local development
			const now = new Date();
			// Format as UTC ISO string
			const year = now.getUTCFullYear();
			const month = String(now.getUTCMonth() + 1).padStart(2, '0');
			const day = String(now.getUTCDate()).padStart(2, '0');
			const hours = String(now.getUTCHours()).padStart(2, '0');
			const minutes = String(now.getUTCMinutes()).padStart(2, '0');
			const nowISO = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;

			itinerary = {
				id,
				title: 'サンプル旅行',
				description: 'ローカル開発用のサンプルしおりです',
				theme: 'travel',
				created_at: now,
				updated_at: now
			} as any;

			timelineItems = [
				{
					id: crypto.randomUUID(),
					itinerary_id: id,
					title: '集合',
					description: '出発準備',
					location_name: '東京駅',
					start_datetime: nowISO,
					end_datetime: (() => {
						const endDate = new Date(now.getTime() + 60*60*1000);
						const endYear = endDate.getUTCFullYear();
						const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0');
						const endDay = String(endDate.getUTCDate()).padStart(2, '0');
						const endHours = String(endDate.getUTCHours()).padStart(2, '0');
						const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');
						return `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:00Z`;
					})(),
					sort_order: 1,
					created_at: nowISO,
					updated_at: nowISO
				}
			];

			packingItems = [
				{
					id: crypto.randomUUID(),
					itinerary_id: id,
					item_name: '着替え',
					category: '衣類',
					quantity: 2,
					is_checked: false,
					memo: '',
					created_at: now,
					updated_at: now
				}
			];

			budgetItems = [
				{
					id: crypto.randomUUID(),
					itinerary_id: id,
					category: '交通費',
					item_name: '電車',
					planned_amount: 1200,
					actual_amount: null,
					memo: '',
					created_at: now,
					updated_at: now
				}
			];
		}

		return json({
			itinerary,
			timelineItems,
			packingItems,
			budgetItems
		});
	} catch (err) {
		console.error('Error fetching itinerary:', err);
		throw error(500, 'Internal server error');
	}
};
