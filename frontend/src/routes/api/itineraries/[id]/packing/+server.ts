import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id } = params;
		const body = await request.json();
		const item_name = body.item_name;
		const category = body.category;
		const quantity = typeof body.quantity === 'number' ? body.quantity : Number(body.quantity) || 1;
		const notes = body.memo ?? body.notes;

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!item_name?.trim()) {
			throw error(400, 'Item name is required');
		}

		const itemId = crypto.randomUUID();
		const now = new Date();
		// Format as UTC ISO string
		const year = now.getUTCFullYear();
		const month = String(now.getUTCMonth() + 1).padStart(2, '0');
		const day = String(now.getUTCDate()).padStart(2, '0');
		const hours = String(now.getUTCHours()).padStart(2, '0');
		const minutes = String(now.getUTCMinutes()).padStart(2, '0');
		const seconds = String(now.getUTCSeconds()).padStart(2, '0');
		const nowISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;

		const packingItem = {
			id: itemId,
			itinerary_id: id,
			item_name: item_name.trim(),
			category: category?.trim() || '',
			quantity,
			is_checked: false,
			memo: (notes ?? '').toString().trim(),
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
