import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { email, password, name } = await request.json();

		if (!email?.trim() || !password?.trim()) {
			throw error(400, 'Email and password are required');
		}

		if (password.length < 6) {
			throw error(400, 'Password must be at least 6 characters');
		}

		const passwordHash = await hashPassword(password);
		const userId = crypto.randomUUID();
		const now = new Date().toISOString();

		const user = {
			id: userId,
			email: email.trim().toLowerCase(),
			password_hash: passwordHash,
			name: name?.trim() || null,
			created_at: now,
			updated_at: now
		};

		if (platform?.env?.DB) {
			const db = platform.env.DB;

			// Check if user already exists
			const existingUser = await db.prepare(`
				SELECT id FROM users WHERE email = ?
			`).bind(user.email).first();

			if (existingUser) {
				throw error(409, 'User already exists');
			}

			await db.prepare(`
				INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)
			`).bind(
				user.id,
				user.email,
				user.password_hash,
				user.name,
				user.created_at,
				user.updated_at
			).run();
		} else {
			console.log('platform', platform);
			console.log('platform.DB', platform?.DB);
			throw error(500, 'Database not available');
		}

		// Don't return password hash
		const { password_hash, ...userResponse } = user;
		return json(userResponse);
	} catch (err) {
		console.error('Error registering user:', err);
		// If this is an HttpError thrown via `error(status, message)`, rethrow
		// so SvelteKit can return the correct status code instead of mapping
		// everything to 500.
		if ((err as any)?.status) throw err;
		throw error(500, 'Internal server error');
	}
};
