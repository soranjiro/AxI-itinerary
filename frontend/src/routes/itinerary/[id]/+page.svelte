<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { tick } from "svelte";
	import {
		Calendar,
		Package,
		Calculator,
		MessageCircle,
		Settings,
		Users,
		Plus,
		Edit3,
		Save,
		X,
		Palette,
	} from "lucide-svelte";
	import AIChat from "$lib/components/AIChat.svelte";
	import AddItemModal from "$lib/components/AddItemModalBasic.svelte";
	import ThemeSelector from "$lib/components/ThemeSelector.svelte";
	import TimelineList from "$lib/components/itinerary/TimelineList.svelte";
	import PackingList from "$lib/components/itinerary/PackingList.svelte";
	import BudgetList from "$lib/components/itinerary/BudgetList.svelte";

	const itineraryId: string = $page.params.id as string;

	let activeTab = "timeline";
	let isLoading = true;
	let error = "";

	// ダミーデータ
	let itinerary = {
		id: itineraryId,
		title: "サンプル旅行",
		description: "これはサンプルの旅行しおりです",
		theme: "simple",
	};

	let timelineItems = [
		{
			id: "1",
			title: "新宿駅出発",
			description: "友人と待ち合わせ",
			start_datetime: "2025-01-15T09:00:00",
			location_name: "新宿駅",
			sort_order: 1,
		},
		{
			id: "2",
			title: "京都到着",
			description: "新幹線で移動",
			start_datetime: "2025-01-15T12:00:00",
			location_name: "京都駅",
			sort_order: 2,
		},
	];

	let packingItems = [
		{
			id: "1",
			item_name: "着替え",
			category: "衣類",
			quantity: 3,
			is_checked: false,
		},
		{
			id: "2",
			item_name: "充電器",
			category: "電子機器",
			quantity: 1,
			is_checked: true,
		},
		{
			id: "3",
			item_name: "パスポート",
			category: "書類",
			quantity: 1,
			is_checked: false,
		},
	];

	let budgetItems = [
		{
			id: "1",
			category: "交通費",
			item_name: "新幹線代",
			planned_amount: 15000,
			actual_amount: null,
		},
		{
			id: "2",
			category: "宿泊費",
			item_name: "ホテル代",
			planned_amount: 8000,
			actual_amount: 8500,
		},
		{
			id: "3",
			category: "食費",
			item_name: "夕食",
			planned_amount: 3000,
			actual_amount: null,
		},
	];

	let editingItem: any = null;
	let isEditing = false;
	let showAddModal = false;
	let addModalType: "timeline" | "packing" | "budget" = "timeline";

	onMount(async () => {
		try {
			const response = await fetch(`/api/itineraries/${itineraryId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch itinerary");
			}
			const data = await response.json();

			itinerary = data.itinerary;
			timelineItems = data.timelineItems;
			packingItems = data.packingItems;
			budgetItems = data.budgetItems;
		} catch (err) {
			console.error("Error loading itinerary:", err);
			error = "しおりの読み込みに失敗しました。";
		} finally {
			isLoading = false;
		}
	});

	const formatDateTime = (dateTime: string) => {
		return new Date(dateTime).toLocaleString("ja-JP", {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("ja-JP", {
			style: "currency",
			currency: "JPY",
		}).format(amount);
	};

	const startEditing = (item: any) => {
		editingItem = { ...item };
		isEditing = true;
	};

	const cancelEditing = () => {
		editingItem = null;
		isEditing = false;
	};

	const saveItem = () => {
		// TODO: 実際の保存処理
		console.log("保存:", editingItem);
		cancelEditing();
	};

	const openAddModal = async (type: "timeline" | "packing" | "budget") => {
		console.log("openAddModal called with type:", type);
		console.log("Current showAddModal value:", showAddModal);

		addModalType = type;
		showAddModal = true;

		console.log("showAddModal set to:", showAddModal);
		console.log("addModalType set to:", addModalType);

		await tick();
		console.log("After tick, showAddModal:", showAddModal);
	};

	const handleAddItem = async (event: CustomEvent) => {
		console.log("handleAddItem called with event:", event);
		const newItem = event.detail;
		console.log("新しいアイテム:", newItem);

		try {
			let endpoint = "";
			if (addModalType === "timeline") {
				endpoint = `/api/itineraries/${itineraryId}/timeline`;
			} else if (addModalType === "packing") {
				endpoint = `/api/itineraries/${itineraryId}/packing`;
			} else if (addModalType === "budget") {
				endpoint = `/api/itineraries/${itineraryId}/budget`;
			}

			console.log("Making API call to:", endpoint);
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newItem),
			});

			console.log("API response status:", response.status);
			if (!response.ok) {
				throw new Error("Failed to add item");
			}

			const addedItem = await response.json();
			console.log("Added item:", addedItem);

			// Update local state
			if (addModalType === "timeline") {
				timelineItems = [...timelineItems, addedItem];
			} else if (addModalType === "packing") {
				packingItems = [...packingItems, addedItem];
			} else if (addModalType === "budget") {
				budgetItems = [...budgetItems, addedItem];
			}

			showAddModal = false;
		} catch (error) {
			console.error("Error adding item:", error);
			alert("アイテムの追加に失敗しました。再度お試しください。");
		}
	};
</script>

<main class="relative overflow-hidden">
	<!-- 動的背景エフェクト -->
	<div class="fixed inset-0 z-0 page-bg-hero"></div>
	{#if isLoading}
		<div class="flex items-center justify-center h-screen">
			<div
				class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8"
			>
				<div
					class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"
				></div>
				<p class="text-xl text-gray-600 dark:text-gray-300 text-center">
					読み込み中...
				</p>
			</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center h-screen">
			<div
				class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8"
			>
				<div class="text-center">
					<div class="text-6xl mb-4">⚠️</div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						エラーが発生しました
					</h2>
					<p class="text-gray-600 dark:text-gray-300">{error}</p>
				</div>
			</div>
		</div>
	{:else}
		<!-- フューチャリスティックヘッダー -->
		<header
			class="relative z-10 glass-panel border-0 border-b border-subtle shadow-2xl"
		>
			<div class="max-w-7xl mx-auto px-6 py-8">
				<div class="flex items-center justify-between">
					<div class="flex-1 space-y-2">
						<h1 class="text-4xl font-bold text-theme-gradient animate-fade-in">
							{itinerary.title}
						</h1>
						{#if itinerary.description}
							<p class="text-xl text-secondary opacity-80 animate-slide-up">
								{itinerary.description}
							</p>
						{/if}
						<div class="flex items-center space-x-3 mt-4">
							<div
								class="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sm font-medium border border-accent"
							>
								<span class="text-theme-gradient">アクティブ</span>
							</div>
							<div
								class="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-sm font-medium border border-accent"
							>
								<span class="text-theme-gradient">同期済み</span>
							</div>
						</div>
					</div>
					<div class="flex items-center space-x-4">
						<ThemeSelector />
						<button
							class="btn btn-ghost group relative overflow-hidden"
							aria-label="members"
						>
							<Users
								class="w-6 h-6 text-accent-primary group-hover:scale-110 transition-transform"
							/>
						</button>
						<button
							class="btn btn-ghost group relative overflow-hidden"
							aria-label="settings"
						>
							<Settings
								class="w-6 h-6 text-accent-primary group-hover:rotate-90 transition-transform duration-500"
							/>
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- タブナビゲーション -->
		<nav
			class="backdrop-blur-glass border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
		>
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex space-x-1">
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab ===
						'timeline'
							? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => (activeTab = "timeline")}
					>
						<Calendar class="w-5 h-5" />
						<span>タイムライン</span>
					</button>
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab ===
						'packing'
							? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => (activeTab = "packing")}
					>
						<Package class="w-5 h-5" />
						<span>持ち物</span>
					</button>
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab ===
						'budget'
							? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => (activeTab = "budget")}
					>
						<Calculator class="w-5 h-5" />
						<span>予算</span>
					</button>
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab ===
						'chat'
							? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => (activeTab = "chat")}
					>
						<MessageCircle class="w-5 h-5" />
						<span>AI相談</span>
					</button>
				</div>
			</div>
		</nav>

		<!-- Mobile bottom nav (only visible on small screens) -->
		<div class="bottom-nav" role="navigation" aria-label="mobile tabs">
			<button
				type="button"
				class="nav-item {activeTab === 'timeline' ? 'active' : ''}"
				aria-current={activeTab === "timeline"}
				on:click={() => (activeTab = "timeline")}
			>
				<div class="text-xs">タイムライン</div>
			</button>
			<button
				type="button"
				class="nav-item {activeTab === 'packing' ? 'active' : ''}"
				aria-current={activeTab === "packing"}
				on:click={() => (activeTab = "packing")}
			>
				<div class="text-xs">持ち物</div>
			</button>
			<button
				type="button"
				class="nav-item {activeTab === 'budget' ? 'active' : ''}"
				aria-current={activeTab === "budget"}
				on:click={() => (activeTab = "budget")}
			>
				<div class="text-xs">予算</div>
			</button>
			<button
				type="button"
				class="nav-item {activeTab === 'chat' ? 'active' : ''}"
				aria-current={activeTab === "chat"}
				on:click={() => (activeTab = "chat")}
			>
				<div class="text-xs">AI相談</div>
			</button>
		</div>

		<!-- コンテンツエリア -->
		<div class="max-w-7xl mx-auto px-4 py-8 backdrop-blur-glass">
			{#if activeTab === "timeline"}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
								タイムライン
							</h2>
							<p class="text-gray-600 dark:text-gray-300 mt-1">
								旅行の予定を時系列で管理しましょう
							</p>
						</div>
						<button
							on:click={() => openAddModal("timeline")}
							class="btn-primary flex items-center space-x-2"
						>
							<Plus class="w-5 h-5" />
							<span>予定を追加</span>
						</button>
					</div>

					<TimelineList
						{timelineItems}
						on:edit={(e) => startEditing(e.detail)}
					/>
				</div>
			{:else if activeTab === "packing"}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
								持ち物リスト
							</h2>
							<p class="text-gray-600 dark:text-gray-300 mt-1">
								必要なアイテムをチェックリストで管理しましょう
							</p>
						</div>
						<button
							on:click={() => openAddModal("packing")}
							class="btn-primary flex items-center space-x-2"
						>
							<Plus class="w-5 h-5" />
							<span>アイテムを追加</span>
						</button>
					</div>

					<div
						class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
					>
						<PackingList
							{packingItems}
							on:edit={(e) => startEditing(e.detail)}
						/>
					</div>
				</div>
			{:else if activeTab === "budget"}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
								予算管理
							</h2>
							<p class="text-gray-600 dark:text-gray-300 mt-1">
								旅行費用の計画と実績を管理しましょう
							</p>
						</div>
						<button
							on:click={() => openAddModal("budget")}
							class="btn-primary flex items-center space-x-2"
						>
							<Plus class="w-5 h-5" />
							<span>費用を追加</span>
						</button>
					</div>

					<div
						class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
					>
						<BudgetList {budgetItems} on:edit={(e) => startEditing(e.detail)} />
					</div>
				</div>
			{:else if activeTab === "chat"}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							AI旅行相談
						</h2>
						<p class="text-gray-600 dark:text-gray-300 mt-1">
							AIと一緒に旅行プランを最適化しましょう
						</p>
					</div>
					<div
						class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6"
					>
						<AIChat {itineraryId} />
					</div>
				</div>
			{/if}
		</div>

		<!-- 編集モーダル -->
		{#if isEditing && editingItem}
			<div
				class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
			>
				<div
					class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto"
				>
					<div class="p-8">
						<div class="flex justify-between items-center mb-6">
							<h3
								class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
							>
								編集
							</h3>
							<button
								on:click={cancelEditing}
								class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 transform hover:scale-110"
							>
								<X class="w-6 h-6" />
							</button>
						</div>

						<div class="space-y-4">
							<!-- ここに編集フォームを追加 -->
							<div>
								<label
									for="edit-input"
									class="block text-sm font-medium text-gray-700 mb-2"
								>
									{#if activeTab === "timeline"}タイトル
									{:else if activeTab === "packing"}アイテム名
									{:else if activeTab === "budget"}項目名{/if}
								</label>
								{#if activeTab === "timeline"}
									<input
										id="edit-input"
										type="text"
										bind:value={editingItem.title}
										class="input-field"
									/>
								{:else if activeTab === "packing"}
									<input
										id="edit-input"
										type="text"
										bind:value={editingItem.item_name}
										class="input-field"
									/>
								{:else if activeTab === "budget"}
									<input
										id="edit-input"
										type="text"
										bind:value={editingItem.item_name}
										class="input-field"
									/>
								{/if}
							</div>
						</div>

						<div class="flex justify-end space-x-4 mt-8">
							<button
								on:click={cancelEditing}
								class="px-6 py-3 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 font-semibold"
							>
								キャンセル
							</button>
							<button
								on:click={saveItem}
								class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center space-x-2"
							>
								<Save class="w-5 h-5" />
								<span>保存</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- 追加アイテムモーダル -->
		{#if showAddModal}
			<AddItemModal
				bind:isOpen={showAddModal}
				type={addModalType}
				on:save={handleAddItem}
			/>
		{/if}
	{/if}
</main>
