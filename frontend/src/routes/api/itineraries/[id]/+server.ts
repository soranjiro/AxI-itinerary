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
			// D1 database not available in development
			throw error(503, 'Database not available. Please use wrangler pages dev for full functionality.');
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