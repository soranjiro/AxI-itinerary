import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, platform }) => {
	try {
		const { id } = params;
		const { title, description, start_datetime, location_name, duration_minutes } = await request.json();

		if (!id) {
			throw error(400, 'Itinerary ID is required');
		}

		if (!title?.trim()) {
			throw error(400, 'Title is required');
		}

		const itemId = crypto.randomUUID();
		const now = new Date().toISOString();

		const startDate = new Date(start_datetime);
		const endDate = new Date(startDate.getTime() + (duration_minutes * 60 * 1000));

		const timelineItem = {
			id: itemId,
			itinerary_id: id,
			title: title.trim(),
			description: description?.trim() || '',
			location_name: location_name?.trim() || '',
			start_datetime,
			end_datetime: endDate.toISOString(),
			sort_order: 0, // Will be set properly later
			created_at: now,
			updated_at: now
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
