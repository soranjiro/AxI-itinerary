<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { BookOpen, Plus, Calendar, MapPin, LogOut } from "lucide-svelte";
	import { user } from "$lib/stores/user";

	let itineraries: any[] = [];
	let isLoading = true;
	let error = "";

	onMount(async () => {
		if (!$user) {
			goto("/");
			return;
		}

		try {
			const response = await fetch(`/api/users/${$user.id}/itineraries`);
			if (!response.ok) {
				throw new Error("Failed to fetch itineraries");
			}
			const data = await response.json();
			itineraries = data;
		} catch (err) {
			console.error("Error loading itineraries:", err);
			error = "しおりの読み込みに失敗しました。";
		} finally {
			isLoading = false;
		}
	});

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, "0");
		const day = String(date.getUTCDate()).padStart(2, "0");
		return `${year}年${month}月${day}日`;
	};

	const viewItinerary = (id: string) => {
		goto(`/itinerary/${id}`);
	};

	const createNewItinerary = () => {
		goto("/");
	};

	const logout = () => {
		user.logout();
		goto("/");
	};
</script>

<main class="min-h-screen bg-bg-primary">
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<!-- ヘッダー -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h1 class="text-3xl font-bold text-primary mb-2">マイしおり</h1>
					<p class="text-text-secondary">
						こんにちは、{$user?.name}さん
					</p>
					<p class="text-text-secondary">作成した旅行しおりの一覧です</p>
				</div>
				<button
					on:click={logout}
					class="flex items-center space-x-2 bg-danger hover:bg-danger-hover text-danger-text font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-custom-lg text-sm"
				>
					<LogOut class="w-4 h-4" />
					<span class="hidden sm:inline">ログアウト</span>
				</button>
			</div>
		</div>
		<button
			on:click={createNewItinerary}
			class="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-primary-text font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-custom-lg hover:shadow-custom-lg"
		>
			<Plus class="w-5 h-5" />
			<span>新しいしおりを作成</span>
		</button>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-16">
			<div
				class="bg-card-bg dark:bg-card-bg-dark backdrop-blur-lg rounded-2xl shadow-custom-xl border border-card-border dark:border-card-border-dark p-8"
			>
				<div
					class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"
				></div>
				<p
					class="text-xl text-text-secondary dark:text-text-dark-secondary text-center"
				>
					読み込み中...
				</p>
			</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center py-16">
			<div
				class="bg-card-bg dark:bg-card-bg-dark backdrop-blur-lg rounded-2xl shadow-custom-xl border border-card-border dark:border-card-border-dark p-8"
			>
				<div class="text-center">
					<div class="text-6xl mb-4">⚠️</div>
					<h2
						class="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2"
					>
						エラーが発生しました
					</h2>
					<p class="text-text-secondary dark:text-text-dark-secondary">
						{error}
					</p>
				</div>
			</div>
		</div>
	{:else if itineraries.length === 0}
		<div class="text-center py-16">
			<BookOpen
				class="w-24 h-24 text-text-muted dark:text-text-dark-muted mx-auto mb-6"
			/>
			<h2
				class="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-4"
			>
				まだしおりがありません
			</h2>
			<p
				class="text-text-secondary dark:text-text-dark-secondary mb-8 max-w-md mx-auto"
			>
				最初の旅行しおりを作成して、素晴らしい旅の思い出を残しましょう
			</p>
			<button
				on:click={createNewItinerary}
				class="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-primary-text font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-custom-lg hover:shadow-custom-lg"
			>
				<Plus class="w-6 h-6" />
				<span>最初のしおりを作成</span>
			</button>
		</div>
	{:else}
		<!-- しおりグリッド -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each itineraries as itinerary}
				<button
					class="card border-card-border p-6 hover:shadow-custom-lg transition-all duration-300 transform hover:scale-105 cursor-pointer text-left w-full hover:shadow-custom-lg"
					on:click={() => viewItinerary(itinerary.id)}
				>
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<h3
								class="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-2 line-clamp-2"
							>
								{itinerary.title}
							</h3>
							{#if itinerary.description}
								<p
									class="text-text-secondary dark:text-text-dark-secondary text-sm line-clamp-2 mb-3"
								>
									{itinerary.description}
								</p>
							{/if}
						</div>
						<div class="flex-shrink-0 ml-4">
							<BookOpen class="w-6 h-6 text-text-primary" />
						</div>
					</div>

					<div
						class="flex items-center justify-between text-sm text-text-muted dark:text-text-dark-muted"
					>
						<div class="flex items-center space-x-1">
							<Calendar class="w-4 h-4" />
							<span>{formatDate(itinerary.updated_at)}</span>
						</div>
						{#if itinerary.role === "owner"}
							<span
								class="px-2 py-1 bg-primary-light dark:bg-primary-light text-primary-text dark:text-primary-text rounded-full text-xs font-medium"
							>
								所有者
							</span>
						{:else}
							<span
								class="px-2 py-1 bg-success-light dark:bg-success-light text-success-text dark:text-success-text rounded-full text-xs font-medium"
							>
								{itinerary.role}
							</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</main>
