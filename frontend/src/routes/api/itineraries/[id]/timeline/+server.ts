import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id } = params;
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

		if (!title?.trim()) {
			throw error(400, 'Title is required');
		}

		const itemId = crypto.randomUUID();
		const now = new Date();

		// 開始日時が未指定の場合は分の部分を00にした現在時刻を使用
		const startISO = start_datetime && !isNaN(Date.parse(start_datetime))
			? start_datetime // Use as-is (local timezone)
			: (() => {
				const date = new Date(now);
				date.setMinutes(0, 0, 0); // 分と秒とミリ秒を0に設定
				// Format as local timezone ISO string
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day}T${hours}:${minutes}:00`;
			})();

		// 終了日時の決定ロジック
		let endISO: string;
		if (end_datetime && !isNaN(Date.parse(end_datetime))) {
			endISO = end_datetime; // Use as-is (local timezone)
		} else if (typeof duration_minutes === 'number' && isFinite(duration_minutes) && duration_minutes > 0) {
			const startDate = new Date(startISO);
			const endDate = new Date(startDate.getTime() + duration_minutes * 60 * 1000);
			// Format as local timezone ISO string
			const year = endDate.getFullYear();
			const month = String(endDate.getMonth() + 1).padStart(2, '0');
			const day = String(endDate.getDate()).padStart(2, '0');
			const hours = String(endDate.getHours()).padStart(2, '0');
			const minutes = String(endDate.getMinutes()).padStart(2, '0');
			endISO = `${year}-${month}-${day}T${hours}:${minutes}:00`;
		} else {
			// デフォルト60分
			const startDate = new Date(startISO);
			const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
			// Format as local timezone ISO string
			const year = endDate.getFullYear();
			const month = String(endDate.getMonth() + 1).padStart(2, '0');
			const day = String(endDate.getDate()).padStart(2, '0');
			const hours = String(endDate.getHours()).padStart(2, '0');
			const minutes = String(endDate.getMinutes()).padStart(2, '0');
			endISO = `${year}-${month}-${day}T${hours}:${minutes}:00`;
		}

		const timelineItem = {
			id: itemId,
			itinerary_id: id,
			title: title.trim(),
			description: description?.trim() || '',
			location_name: location_name?.trim() || '',
			start_datetime: startISO,
			end_datetime: endISO,
			sort_order: 0, // Will be set properly later
			created_at: now.toISOString(),
			updated_at: now.toISOString()
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			// Get max sort_order
			const maxOrderResult = await db.prepare(`
				SELECT MAX(sort_order) as max_order FROM timeline_items WHERE itinerary_id = ?
			`).bind(id).first();

			timelineItem.sort_order = (maxOrderResult?.max_order || 0) + 1;

			await db.prepare(`
				INSERT INTO timeline_items (id, itinerary_id, title, description, location_name, start_datetime, end_datetime, sort_order, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`).bind(
				timelineItem.id,
				timelineItem.itinerary_id,
				timelineItem.title,
				timelineItem.description,
				timelineItem.location_name,
				timelineItem.start_datetime,
				timelineItem.end_datetime,
				timelineItem.sort_order,
				timelineItem.created_at,
				timelineItem.updated_at
			).run();
		}

		return json(timelineItem);
	} catch (err) {
		console.error('Error creating timeline item:', err);
		throw error(500, 'Internal server error');
	}
};
