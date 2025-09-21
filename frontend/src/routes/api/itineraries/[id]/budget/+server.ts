import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id } = params;
		const body = await request.json();
		const item_name = body.item_name;
		const category = body.category;
		const planned_amount_raw = body.planned_amount;
		const notes = body.memo ?? body.notes;

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!item_name?.trim()) {
			throw error(400, 'Item name is required');
		}

		const planned_amount = typeof planned_amount_raw === 'number' ? planned_amount_raw : Number(planned_amount_raw);
		if (!planned_amount || planned_amount <= 0) {
			throw error(400, 'Valid planned amount is required');
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

		const budgetItem = {
			id: itemId,
			itinerary_id: id,
			category: category?.trim() || '',
			item_name: item_name.trim(),
			planned_amount: Number(planned_amount),
			actual_amount: null,
			memo: (notes ?? '').toString().trim(),
			created_at: now,
			updated_at: now
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			await db.prepare(`
				INSERT INTO budget_items (id, itinerary_id, category, item_name, planned_amount, actual_amount, memo, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`).bind(
				budgetItem.id,
				budgetItem.itinerary_id,
				budgetItem.category,
				budgetItem.item_name,
				budgetItem.planned_amount,
				budgetItem.actual_amount,
				budgetItem.memo,
				budgetItem.created_at,
				budgetItem.updated_at
			).run();
		}

		return json(budgetItem);
	} catch (err) {
		console.error('Error creating budget item:', err);
		throw error(500, 'Internal server error');
	}
};
