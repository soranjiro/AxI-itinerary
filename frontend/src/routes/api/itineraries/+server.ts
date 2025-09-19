import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	try {
		const { title, description, password } = await request.json();

		if (!title?.trim()) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Generate unique ID
		const id = crypto.randomUUID();

		// Get current user from cookie
		let currentUser = null;
		try {
			const userCookie = cookies.get('user');
			if (userCookie) {
				currentUser = JSON.parse(userCookie);
			}
		} catch (e) {
			// Invalid cookie, continue as guest
		}

		// For now, store in memory or use D1 if available
		// TODO: Implement proper database storage
		const itinerary = {
			id,
			title: title.trim(),
			description: description?.trim() || '',
			edit_password_hash: password || null,
			theme: 'travel',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		// If D1 is available, store in database
		if (platform?.env?.DB) {
			const db = platform.env.DB;
			await db.prepare(`
				INSERT INTO itineraries (id, title, description, edit_password_hash, theme, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`).bind(
				itinerary.id,
				itinerary.title,
				itinerary.description,
				itinerary.edit_password_hash,
				itinerary.theme,
				itinerary.created_at,
				itinerary.updated_at
			).run();

			// デフォルトデータを投入
			const now = new Date();
			const t1 = crypto.randomUUID();
			const t2 = crypto.randomUUID();
			await db.batch([
				db.prepare(`INSERT INTO timeline_items (id, itinerary_id, title, description, location_name, start_datetime, end_datetime, sort_order, created_at, updated_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
					.bind(
						t1,
						itinerary.id,
						'集合',
						'出発前に軽食',
						'東京駅',
						new Date(now.getTime() + 24*60*60*1000).toISOString(),
						new Date(now.getTime() + 25*60*60*1000).toISOString(),
						1,
						itinerary.created_at,
						itinerary.updated_at
					),
				db.prepare(`INSERT INTO timeline_items (id, itinerary_id, title, description, location_name, start_datetime, end_datetime, sort_order, created_at, updated_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
					.bind(
						t2,
						itinerary.id,
						'チェックイン',
						'ホテルで休憩',
						'横浜ベイホテル',
						new Date(now.getTime() + 27*60*60*1000).toISOString(),
						new Date(now.getTime() + 28*60*60*1000).toISOString(),
						2,
						itinerary.created_at,
						itinerary.updated_at
					),
				db.prepare(`INSERT INTO packing_items (id, itinerary_id, item_name, category, quantity, is_checked, memo, created_at, updated_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
					.bind(
						crypto.randomUUID(), itinerary.id, '着替え', '衣類', 2, 0, '', itinerary.created_at, itinerary.updated_at
					),
				db.prepare(`INSERT INTO budget_items (id, itinerary_id, category, item_name, planned_amount, actual_amount, memo, created_at, updated_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
					.bind(
						crypto.randomUUID(), itinerary.id, '交通費', '電車', 1200, null, '', itinerary.created_at, itinerary.updated_at
					)
			]);

			// Link to user if logged in
			if (currentUser?.id) {
				await db.prepare(`
					INSERT INTO user_itineraries (id, user_id, itinerary_id, role)
					VALUES (?, ?, ?, ?)
				`).bind(
					crypto.randomUUID(),
					currentUser.id,
					itinerary.id,
					'owner'
				).run();
			}
		} else {
			// D1 not available in development - just return success
			console.log('D1 database not available. Itinerary created in memory only.');
		}

		return json({ id: itinerary.id });
	} catch (error) {
		console.error('Error creating itinerary:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
