import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { message, itineraryId, context } = await request.json();

		if (!message?.trim()) {
			throw error(400, 'Message is required');
		}

		// ProviderとAPIキーを環境変数から選択（ハードコード禁止）
		const provider = (platform?.env as any)?.LLM_PROVIDER || 'openai';
		const openaiKey = (platform?.env as any)?.OPENAI_API_KEY;
		const geminiKey = (platform?.env as any)?.GEMINI_API_KEY;

		let apiKey: string | undefined;
		let endpoint = '';
		let payload: any;

		// Build context for AI
		let systemPrompt = `あなたは旅行計画をサポートするAIアシスタントです。
ユーザーの質問に対して、役立つアドバイスを提供してください。
旅行のタイムライン、予算、持ち物リストについて具体的な提案をしてください。

現在の旅行情報:
${context ? JSON.stringify(context, null, 2) : '情報なし'}`;

		if (provider === 'gemini') {
			apiKey = geminiKey;
			if (!apiKey) throw error(500, 'Gemini API key not configured');
			endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
			payload = {
				contents: [
					{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${message}` }] }
				]
			};
		} else {
			apiKey = openaiKey;
			if (!apiKey) throw error(500, 'OpenAI API key not configured');
			endpoint = 'https://api.openai.com/v1/chat/completions';
			payload = {
				model: 'gpt-3.5-turbo',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: message }
				],
				max_tokens: 1000,
				temperature: 0.7
			};
		}

		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (provider === 'openai') headers['Authorization'] = `Bearer ${apiKey}`;

		const response = await fetch(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw error(500, 'Failed to get AI response');
		}

		const data = await response.json();
		let aiMessage = '申し訳ありませんが、応答を生成できませんでした。';
		if (provider === 'gemini') {
			aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || aiMessage;
		} else {
			aiMessage = data?.choices?.[0]?.message?.content || aiMessage;
		}

		return json({
			message: aiMessage,
			suggestions: generateSuggestions(message)
		});
	} catch (err) {
		console.error('Error in chat:', err);
		throw error(500, 'Internal server error');
	}
};

function generateSuggestions(userMessage: string) {
	const suggestions = [];

	if (userMessage.includes('観光') || userMessage.includes('スポット')) {
		suggestions.push(
			{ type: 'timeline', title: 'タイムラインに追加', action: 'おすすめスポットをスケジュールに追加' },
			{ type: 'timeline', title: '移動時間を計算', action: '各スポット間の移動時間を確認' }
		);
	}

	if (userMessage.includes('予算') || userMessage.includes('費用')) {
		suggestions.push(
			{ type: 'budget', title: '予算項目を追加', action: '新しい費用項目を追加' },
			{ type: 'budget', title: '予算を見直す', action: '現在の予算を最適化' }
		);
	}

	if (userMessage.includes('持ち物') || userMessage.includes('荷物')) {
		suggestions.push(
			{ type: 'packing', title: '持ち物を追加', action: '新しいアイテムをリストに追加' },
			{ type: 'packing', title: 'チェックリストを確認', action: '持ち物リストを再確認' }
		);
	}

	return suggestions.slice(0, 2); // Max 2 suggestions
}
