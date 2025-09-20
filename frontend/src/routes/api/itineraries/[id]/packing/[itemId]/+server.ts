import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id, itemId } = params;
		const body = await request.json();
		const item_name = body.item_name;
		const category = body.category;
		const quantity = typeof body.quantity === 'number' ? body.quantity : Number(body.quantity) || 1;
		const is_checked = body.is_checked;
		const notes = body.memo ?? body.notes;

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!itemId) {
			throw error(400, 'Packing item ID is required');
		}

		if (!item_name?.trim()) {
			throw error(400, 'Item name is required');
		}

		const now = new Date().toISOString();

		const updatedItem = {
			id: itemId,
			itinerary_id: id,
			item_name: item_name.trim(),
			category: category?.trim() || '',
			quantity,
			is_checked: is_checked || false,
			memo: (notes ?? '').toString().trim(),
			updated_at: now
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			await db.prepare(`
				UPDATE packing_items
				SET item_name = ?, category = ?, quantity = ?, is_checked = ?, memo = ?, updated_at = ?
				WHERE id = ? AND itinerary_id = ?
			`).bind(
				updatedItem.item_name,
				updatedItem.category,
				updatedItem.quantity,
				updatedItem.is_checked,
				updatedItem.memo,
				updatedItem.updated_at,
				updatedItem.id,
				updatedItem.itinerary_id
			).run();
		}

		return json(updatedItem);
	} catch (err) {
		console.error('Error updating packing item:', err);
		throw error(500, 'Internal server error');
	}
};

export const DELETE: RequestHandler = async ({ params, platform }) => {
	try {
		const { id, itemId } = params;

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!itemId) {
			throw error(400, 'Packing item ID is required');
		}

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			const result = await db.prepare(`
				DELETE FROM packing_items
				WHERE id = ? AND itinerary_id = ?
			`).bind(itemId, id).run();

			if (result.changes === 0) {
				throw error(404, 'Packing item not found');
			}
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting packing item:', err);
		throw error(500, 'Internal server error');
	}
};
