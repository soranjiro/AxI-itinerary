import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id, itemId } = params;
		const {
			title,
			description,
			start_datetime,
			end_datetime,
			location_name,
			duration_minutes
		} = await request.json();

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!itemId) {
			throw error(400, 'Timeline item ID is required');
		}

		if (!title?.trim()) {
			throw error(400, 'Title is required');
		}

		const now = new Date();

		// 開始日時が未指定の場合は分の部分を00にした現在時刻を使用
		const startISO = start_datetime && !isNaN(Date.parse(start_datetime))
			? new Date(start_datetime).toISOString()
			: (() => {
				const date = new Date(now);
				date.setMinutes(0, 0, 0); // 分と秒とミリ秒を0に設定
				return date.toISOString();
			})();

		// 終了日時の決定ロジック
		let endISO: string;
		if (end_datetime && !isNaN(Date.parse(end_datetime))) {
			endISO = new Date(end_datetime).toISOString();
		} else if (typeof duration_minutes === 'number' && isFinite(duration_minutes) && duration_minutes > 0) {
			const startDate = new Date(startISO);
			endISO = new Date(startDate.getTime() + duration_minutes * 60 * 1000).toISOString();
		} else {
			// デフォルト60分
			const startDate = new Date(startISO);
			endISO = new Date(startDate.getTime() + 60 * 60 * 1000).toISOString();
		}

		const updatedItem = {
			id: itemId,
			itinerary_id: id,
			title: title.trim(),
			description: description?.trim() || '',
			location_name: location_name?.trim() || '',
			start_datetime: startISO,
			end_datetime: endISO,
			updated_at: now.toISOString()
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			await db.prepare(`
				UPDATE timeline_items
				SET title = ?, description = ?, location_name = ?, start_datetime = ?, end_datetime = ?, updated_at = ?
				WHERE id = ? AND itinerary_id = ?
			`).bind(
				updatedItem.title,
				updatedItem.description,
				updatedItem.location_name,
				updatedItem.start_datetime,
				updatedItem.end_datetime,
				updatedItem.updated_at,
				updatedItem.id,
				updatedItem.itinerary_id
			).run();
		}

		return json(updatedItem);
	} catch (err) {
		console.error('Error updating timeline item:', err);
		throw error(500, 'Internal server error');
	}
};
