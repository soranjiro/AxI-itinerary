import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email?.trim() || !password?.trim()) {
			throw error(400, 'Email and password are required');
		}

		const passwordHash = await hashPassword(password);
		const userEmail = email.trim().toLowerCase();

		let user = null;

		if (platform?.DB) {
			const db = platform.DB;

			user = await db.prepare(`
				SELECT id, email, name, created_at FROM users WHERE email = ? AND password_hash = ?
			`).bind(userEmail, passwordHash).first();
		}

		if (!user) {
			throw error(401, 'Invalid credentials');
		}

		// Simple session token (in production, use proper JWT)
		const sessionToken = crypto.randomUUID();

		// Store session (simplified - in production use proper session store)
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		// Store user info in cookie (simplified)
		cookies.set('user', JSON.stringify({
			id: user.id,
			email: user.email,
			name: user.name
		}), {
			path: '/',
			httpOnly: false, // Allow client access
			secure: true,
			maxAge: 60 * 60 * 24 * 7
		});

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name
			}
		});
	} catch (err) {
		console.error('Error logging in:', err);
		// If this is an HttpError thrown via `error(status, message)`, rethrow
		// so SvelteKit can return the correct status code instead of mapping
		// everything to 500.
		if ((err as any)?.status) throw err;
		throw error(500, 'Internal server error');
	}
};
