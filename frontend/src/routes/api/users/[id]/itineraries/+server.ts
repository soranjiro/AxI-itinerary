import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		const { id } = params;

		if (!id) {
			throw error(400, 'User ID is required');
		}

		let itineraries = [];

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			const result = await db.prepare(`
				SELECT i.*, ui.role, ui.created_at as linked_at
				FROM itineraries i
				JOIN user_itineraries ui ON i.id = ui.itinerary_id
				WHERE ui.user_id = ?
				ORDER BY i.updated_at DESC
			`).bind(id).all();

			itineraries = result.results || [];
		}

		return json(itineraries);
	} catch (err) {
		console.error('Error fetching user itineraries:', err);
		throw error(500, 'Internal server error');
	}
};
