import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id } = params;
		const { item_name, category, quantity, notes } = await request.json();

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!item_name?.trim()) {
			throw error(400, 'Item name is required');
		}

		const itemId = crypto.randomUUID();
		const now = new Date().toISOString();

		const packingItem = {
			id: itemId,
			itinerary_id: id,
			item_name: item_name.trim(),
			category: category?.trim() || '',
			quantity: quantity || 1,
			is_checked: false,
			memo: notes?.trim() || '',
			created_at: now,
			updated_at: now
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			await db.prepare(`
				INSERT INTO packing_items (id, itinerary_id, item_name, category, quantity, is_checked, memo, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`).bind(
				packingItem.id,
				packingItem.itinerary_id,
				packingItem.item_name,
				packingItem.category,
				packingItem.quantity,
				packingItem.is_checked,
				packingItem.memo,
				packingItem.created_at,
				packingItem.updated_at
			).run();
		}

		return json(packingItem);
	} catch (err) {
		console.error('Error creating packing item:', err);
		throw error(500, 'Internal server error');
	}
};
