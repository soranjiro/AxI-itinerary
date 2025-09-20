import { json, error, type RequestEvent } from '@sveltejs/kit';

export async function GET({ params }: RequestEvent) {
	const { id } = params;

	// TODO: データベースからユーザーを取得
	// 仮の実装
	const user = {
		id,
		email: 'user@example.com',
		name: 'ユーザー'
	};

	return json(user);
}

export async function PATCH({ params, request }: RequestEvent) {
	const { id } = params;
	const data = await request.json();

	// TODO: データベースでユーザーを更新
	// 仮の実装
	const updatedUser = {
		id,
		email: 'user@example.com',
		name: 'ユーザー'
	};

	return json(updatedUser);
}
