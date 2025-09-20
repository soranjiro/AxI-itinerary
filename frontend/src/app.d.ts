// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB?: D1Database;
				OPENAI_API_KEY?: string;
				GEMINI_API_KEY?: string;
				LLM_PROVIDER?: 'openai' | 'gemini';
				ASSETS?: any;
			};
			DB?: D1Database;
			ASSETS?: any;
		}
	}
}

export {};
