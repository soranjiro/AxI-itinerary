import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id, itemId } = params;
		const body = await request.json();
		const item_name = body.item_name;
		const category = body.category;
		const planned_amount = typeof body.planned_amount === 'number' ? body.planned_amount : Number(body.planned_amount) || 0;
		const actual_amount = body.actual_amount !== undefined ? (typeof body.actual_amount === 'number' ? body.actual_amount : Number(body.actual_amount) || null) : null;

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!itemId) {
			throw error(400, 'Budget item ID is required');
		}

		if (!item_name?.trim()) {
			throw error(400, 'Item name is required');
		}

		const now = new Date();
		// Format as UTC ISO string
		const year = now.getUTCFullYear();
		const month = String(now.getUTCMonth() + 1).padStart(2, '0');
		const day = String(now.getUTCDate()).padStart(2, '0');
		const hours = String(now.getUTCHours()).padStart(2, '0');
		const minutes = String(now.getUTCMinutes()).padStart(2, '0');
		const seconds = String(now.getUTCSeconds()).padStart(2, '0');
		const nowISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;

		const updatedItem = {
			id: itemId,
			itinerary_id: id,
			item_name: item_name.trim(),
			category: category?.trim() || '',
			planned_amount,
			actual_amount,
			updated_at: now
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			await db.prepare(`
				UPDATE budget_items
				SET item_name = ?, category = ?, planned_amount = ?, actual_amount = ?, updated_at = ?
				WHERE id = ? AND itinerary_id = ?
			`).bind(
				updatedItem.item_name,
				updatedItem.category,
				updatedItem.planned_amount,
				updatedItem.actual_amount,
				updatedItem.updated_at,
				updatedItem.id,
				updatedItem.itinerary_id
			).run();
		}

		return json(updatedItem);
	} catch (err) {
		console.error('Error updating budget item:', err);
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
			throw error(400, 'Budget item ID is required');
		}

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			const result = await db.prepare(`
				DELETE FROM budget_items
				WHERE id = ? AND itinerary_id = ?
			`).bind(itemId, id).run();

			if (result.changes === 0) {
				throw error(404, 'Budget item not found');
			}
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting budget item:', err);
		throw error(500, 'Internal server error');
	}
};
