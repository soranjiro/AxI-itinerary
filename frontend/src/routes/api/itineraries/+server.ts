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
			theme: 'simple',
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
