<script lang="ts">
	import { Send, Bot, User, Sparkles, MapPin, Calendar } from "lucide-svelte";
	import { onMount } from "svelte";

	export let itineraryId: string;

	let messages: Array<{
		id: string;
		content: string;
		sender: "user" | "ai";
		timestamp: Date;
		suggestions?: Array<{ type: string; title: string; action: string }>;
	}> = [];

	let inputMessage = "";
	let isLoading = false;
	let chatContainer: HTMLElement;

	// ダミーデータ
	const initialMessages = [
		{
			id: "1",
			content:
				"こんにちは！私はあなたの旅行計画をサポートするAIアシスタントです。どのようなお手伝いができますか？",
			sender: "ai" as const,
			timestamp: new Date(),
			suggestions: [
				{
					type: "timeline",
					title: "観光スポットを追加",
					action: "おすすめの観光スポットを教えて",
				},
				{ type: "budget", title: "予算を最適化", action: "予算を見直したい" },
				{
					type: "packing",
					title: "持ち物チェック",
					action: "持ち物リストを確認して",
				},
			],
		},
	];

	onMount(() => {
		messages = initialMessages;
		scrollToBottom();
	});

	const scrollToBottom = () => {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	};

	const sendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage = {
			id: Date.now().toString(),
			content: inputMessage,
			sender: "user" as const,
			timestamp: new Date(),
		};

		messages = [...messages, userMessage];
		const currentInput = inputMessage;
		inputMessage = "";
		isLoading = true;
		scrollToBottom();

		try {
			// Build context from itinerary data
			const context = {
				itineraryTitle: itineraryId, // TODO: Pass actual itinerary data
				messageCount: messages.length,
			};

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: currentInput,
					itineraryId,
					context,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get AI response");
			}

			const data = await response.json();

			const aiResponse = {
				id: (Date.now() + 1).toString(),
				content: data.message,
				sender: "ai" as const,
				timestamp: new Date(),
				suggestions: data.suggestions || [],
			};

			messages = [...messages, aiResponse];
		} catch (error) {
			console.error("Error sending message:", error);
			const errorResponse = {
				id: (Date.now() + 1).toString(),
				content:
					"申し訳ありませんが、エラーが発生しました。APIキーが設定されているか確認してください。",
				sender: "ai" as const,
				timestamp: new Date(),
				suggestions: [],
			};
			messages = [...messages, errorResponse];
		} finally {
			isLoading = false;
			scrollToBottom();
		}
	};

	const generateAIResponse = (input: string): string => {
		// シンプルなダミー応答
		if (input.includes("観光") || input.includes("スポット")) {
			return "素晴らしいですね！京都でしたら、清水寺、金閣寺、伏見稲荷大社などがおすすめです。時間に余裕があれば嵐山の竹林も美しいですよ。どの時間帯に訪問予定ですか？";
		} else if (input.includes("予算")) {
			return "予算管理についてですね。現在の予算を確認したところ、交通費と宿泊費で23,500円、食費で3,000円の予定ですね。お土産代やその他の費用も考慮して、5,000円程度の余裕を持たせることをお勧めします。";
		} else if (input.includes("持ち物")) {
			return "持ち物リストを確認しますね。季節や目的地を考慮すると、防寒具や雨具、歩きやすい靴があると良さそうです。また、充電器は既にリストに入っていますが、モバイルバッテリーも追加してはいかがでしょうか？";
		} else {
			return "ご質問ありがとうございます。より具体的にお教えいただけると、詳しいアドバイスができます。例えば、「おすすめの観光スポット」「予算の見直し」「持ち物の確認」などについてお聞かせください。";
		}
	};

	const generateSuggestions = (input: string) => {
		if (input.includes("観光") || input.includes("スポット")) {
			return [
				{
					type: "timeline",
					title: "タイムラインに追加",
					action: "清水寺を午前中のスケジュールに追加",
				},
				{
					type: "timeline",
					title: "移動時間を計算",
					action: "各スポット間の移動時間を教えて",
				},
			];
		} else if (input.includes("予算")) {
			return [
				{
					type: "budget",
					title: "予算項目を追加",
					action: "お土産代を予算に追加",
				},
				{
					type: "budget",
					title: "費用を見積もり",
					action: "1日あたりの食費を計算",
				},
			];
		} else if (input.includes("持ち物")) {
			return [
				{
					type: "packing",
					title: "リストに追加",
					action: "モバイルバッテリーを持ち物リストに追加",
				},
				{
					type: "packing",
					title: "天気を確認",
					action: "旅行先の天気予報を確認",
				},
			];
		}
		return [];
	};

	const handleSuggestionClick = (suggestion: { action: string }) => {
		inputMessage = suggestion.action;
		sendMessage();
	};

	const handleKeypress = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const formatTime = (timestamp: Date) => {
		return timestamp.toLocaleTimeString("ja-JP", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};
</script>

<div class="flex flex-col h-[600px] card border-border overflow-hidden">
	<!-- チャットヘッダー -->
	<div
		class="flex items-center justify-between p-6 border-b border-border bg-bg-secondary"
	>
		<div class="flex items-center space-x-4">
			<div class="icon-theme-container">
				<Bot class="w-7 h-7 text-white" />
			</div>
			<div>
				<h3 class="text-lg font-bold text-text-primary">AI旅行アシスタント</h3>
				<p class="text-sm text-text-secondary">旅行プランをサポートします</p>
			</div>
		</div>
		<div class="flex items-center space-x-2">
			<div class="w-3 h-3 bg-success rounded-full animate-pulse"></div>
			<span class="text-sm text-text-muted">オンライン</span>
		</div>
	</div>

	<!-- メッセージエリア -->
	<div bind:this={chatContainer} class="flex-1 overflow-y-auto p-6 space-y-6">
		{#each messages as message}
			<div
				class="flex {message.sender === 'user'
					? 'justify-end'
					: 'justify-start'}"
			>
				<div
					class="flex max-w-[80%] {message.sender === 'user'
						? 'flex-row-reverse'
						: 'flex-row'} items-start space-x-3"
				>
					<!-- アバター -->
					<div
						class="icon-theme-container flex-shrink-0 shadow-lg {message.sender ===
						'user'
							? 'bg-[var(--gradient-primary)] ml-3'
							: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mr-3'}"
					>
						{#if message.sender === "user"}
							<User class="w-5 h-5 text-white" />
						{:else}
							<Bot class="w-5 h-5 text-gray-600 dark:text-gray-300" />
						{/if}
					</div>

					<!-- メッセージバブル -->
					<div class="flex flex-col">
						<div
							class="rounded-2xl px-6 py-4 shadow-lg {message.sender === 'user'
								? 'bg-gradient-primary text-white'
								: 'bg-card-bg text-text-primary border-border'}"
						>
							<p class="text-sm whitespace-pre-wrap leading-relaxed">
								{message.content}
							</p>
						</div>
						<span
							class="text-xs text-text-muted mt-2 px-2 {message.sender ===
							'user'
								? 'text-right'
								: 'text-left'}"
						>
							{formatTime(message.timestamp)}
						</span>

						<!-- AI提案 -->
						{#if message.sender === "ai" && message.suggestions && message.suggestions.length > 0}
							<div class="mt-4 space-y-3">
								{#each message.suggestions as suggestion}
									<button
										on:click={() => handleSuggestionClick(suggestion)}
										class="flex items-center space-x-3 px-4 py-3 text-sm bg-secondary-light hover:bg-secondary-light text-secondary rounded-xl border-border transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md w-full text-left"
									>
										{#if suggestion.type === "timeline"}
											<Calendar class="w-5 h-5" />
										{:else if suggestion.type === "budget"}
											<span class="text-lg">💰</span>
										{:else if suggestion.type === "packing"}
											<span class="text-lg">🎒</span>
										{:else}
											<MapPin class="w-5 h-5" />
										{/if}
										<span class="font-medium">{suggestion.title}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}

		<!-- ローディング表示 -->
		{#if isLoading}
			<div class="flex justify-start">
				<div class="flex items-start space-x-3">
					<div
						class="icon-theme-container rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg"
					>
						<Bot class="w-5 h-5 text-gray-600 dark:text-gray-300" />
					</div>
					<div
						class="bg-white dark:bg-gray-700 rounded-2xl px-6 py-4 shadow-lg border-theme-glow"
					>
						<div class="flex space-x-2">
							<div
								class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
							></div>
							<div
								class="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
								style="animation-delay: 0.1s"
							></div>
							<div
								class="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
								style="animation-delay: 0.2s"
							></div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- 入力エリア -->
	<div class="border-t border-border p-6 bg-bg-tertiary">
		<div class="flex space-x-4">
			<div class="flex-1 relative">
				<input
					bind:value={inputMessage}
					on:keypress={handleKeypress}
					placeholder="AIに質問してみましょう..."
					disabled={isLoading}
					class="input-field disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				{#if inputMessage.trim()}
					<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
						<Sparkles class="w-5 h-5 text-accent animate-pulse" />
					</div>
				{/if}
			</div>
			<button
				on:click={sendMessage}
				disabled={!inputMessage.trim() || isLoading}
				class="px-6 py-4 bg-gradient-primary hover:bg-gradient-primary disabled:bg-text-muted disabled:text-bg-primary text-white rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
			>
				{#if isLoading}
					<div
						class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
					></div>
				{:else}
					<Send class="w-5 h-5" />
				{/if}
			</button>
		</div>
		<p class="text-xs text-text-muted mt-3 text-center">
			例:
			「おすすめの観光スポットを教えて」「予算を見直したい」「持ち物リストを確認して」
		</p>
	</div>
</div>
