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
	import QuickAddModal from "$lib/components/QuickAddModal.svelte";
	import ThemeSelector from "$lib/components/ThemeSelector.svelte";
	import ItineraryThemeSelector from "$lib/components/ItineraryThemeSelector.svelte";
	import { itineraryTheme } from "$lib/stores/itineraryTheme";
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
		theme: "travel", // しおりテーマを追加
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
	let showSettingsModal = false;
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

			// しおりのテーマを適用
			if (itinerary.theme) {
				itineraryTheme.init(itinerary.theme);
			}
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

	const formatDateTimeForInput = (dateTime: string) => {
		if (!dateTime) return "";
		const date = new Date(dateTime);
		// datetime-local input expects format: YYYY-MM-DDTHH:mm
		return date.toISOString().slice(0, 16);
	};

	const parseDateTimeFromInput = (inputValue: string) => {
		if (!inputValue) return "";
		// Convert local datetime to ISO string
		return new Date(inputValue).toISOString();
	};

	const startEditing = (item: any) => {
		editingItem = { ...item };
		// 編集時のデフォルトとして、分の部分を00に揃える
		if (editingItem.start_datetime) {
			const date = new Date(editingItem.start_datetime);
			date.setMinutes(0, 0, 0);
			editingItem.start_datetime = date.toISOString();
		}
		isEditing = true;
	};

	const cancelEditing = () => {
		editingItem = null;
		isEditing = false;
	};

	const saveItem = async () => {
		try {
			let endpoint = "";
			let requestBody = {};

			if (activeTab === "timeline") {
				endpoint = `/api/itineraries/${itineraryId}/timeline/${editingItem.id}`;
				requestBody = {
					title: editingItem.title,
					description: editingItem.description,
					location_name: editingItem.location_name,
					start_datetime: editingItem.start_datetime,
				};
			} else if (activeTab === "packing") {
				endpoint = `/api/itineraries/${itineraryId}/packing/${editingItem.id}`;
				requestBody = {
					item_name: editingItem.item_name,
					category: editingItem.category,
					quantity: editingItem.quantity,
					is_checked: editingItem.is_checked,
				};
			} else if (activeTab === "budget") {
				endpoint = `/api/itineraries/${itineraryId}/budget/${editingItem.id}`;
				requestBody = {
					item_name: editingItem.item_name,
					category: editingItem.category,
					planned_amount: editingItem.planned_amount,
					actual_amount: editingItem.actual_amount,
				};
			}

			const response = await fetch(endpoint, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				throw new Error("Failed to update item");
			}

			const updatedItem = await response.json();

			// Update local state
			if (activeTab === "timeline") {
				timelineItems = timelineItems.map((item) =>
					item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
				);
			} else if (activeTab === "packing") {
				packingItems = packingItems.map((item) =>
					item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
				);
			} else if (activeTab === "budget") {
				budgetItems = budgetItems.map((item) =>
					item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
				);
			}

			cancelEditing();
		} catch (error) {
			console.error("Error saving item:", error);
			alert("アイテムの保存に失敗しました。再度お試しください。");
		}
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

	const closeSettingsModal = () => {
		showSettingsModal = false;
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

<main class="min-h-screen" style="background-color: var(--bg-primary);">
	<!-- 動的背景エフェクト -->
	<div
		class="fixed inset-0 z-0 opacity-5"
		style="background: var(--gradient-primary);"
	></div>

	{#if isLoading}
		<div class="flex items-center justify-center h-screen">
			<div
				class="bg-card-bg border border-card-border rounded-2xl shadow-custom-lg p-8 backdrop-blur-lg"
			>
				<div
					class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"
				></div>
				<p class="text-xl text-text-secondary text-center">読み込み中...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center h-screen">
			<div
				class="bg-card-bg border border-card-border rounded-2xl shadow-custom-lg p-8 backdrop-blur-lg"
			>
				<div class="text-center">
					<div class="text-6xl mb-4">⚠️</div>
					<h2 class="text-2xl font-bold text-text-primary mb-2">
						エラーが発生しました
					</h2>
					<p class="text-text-secondary">{error}</p>
				</div>
			</div>
		</div>
	{:else}
		<!-- モバイル用ヘッダー（スクロール可能）-->
		<div
			class="border-b border-border shadow-sm bg-card-bg/95 backdrop-blur-lg"
		>
			<div class="max-w-2xl mx-auto px-4 py-6" style="max-width: 640px;">
				<div class="space-y-4">
					<h1 class="text-2xl sm:text-3xl font-bold text-text-primary">
						{itinerary.title}
					</h1>
					{#if itinerary.description}
						<p class="text-base text-text-secondary">
							{itinerary.description}
						</p>
					{/if}
					<div class="flex items-center flex-wrap gap-2">
						<div
							class="px-3 py-1 rounded-full bg-primary/10 text-sm font-medium border border-primary/20"
						>
							<span class="text-primary">アクティブ</span>
						</div>
						<div
							class="px-3 py-1 rounded-full bg-success/10 text-sm font-medium border border-success/20"
						>
							<span class="text-success">同期済み</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- デスクトップ用タブナビゲーション（スマホでは非表示）-->
		<nav
			class="bg-card-bg/70 border-b border-card-border/50 backdrop-blur-xl sticky top-0 z-10 py-4 hidden sm:block"
		>
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex justify-center">
					<div
						class="flex bg-bg-secondary/60 p-2 rounded-2xl border border-border/40 shadow-lg backdrop-blur-lg"
					>
						<button
							class="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-sm
							       transition-all duration-300 overflow-hidden
							       {activeTab === 'timeline'
								? 'text-accent-text bg-gradient-to-r from-accent to-accent-secondary shadow-lg scale-105'
								: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}"
							on:click={() => (activeTab = "timeline")}
						>
							{#if activeTab !== "timeline"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/5 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
							{/if}

							{#if activeTab === "timeline"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-bg-primary/10 to-bg-primary/20
								            animate-pulse rounded-xl"
								></div>
							{/if}

							<Calendar class="relative w-5 h-5" />
							<span class="relative">タイムライン</span>
						</button>

						<button
							class="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-sm
							       transition-all duration-300 overflow-hidden
							       {activeTab === 'packing'
								? 'text-accent-text bg-gradient-to-r from-accent to-accent-secondary shadow-lg scale-105'
								: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}"
							on:click={() => (activeTab = "packing")}
						>
							{#if activeTab !== "packing"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/5 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
							{/if}

							{#if activeTab === "packing"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-bg-primary/10 to-bg-primary/20
								            animate-pulse rounded-xl"
								></div>
							{/if}

							<Package class="relative w-5 h-5" />
							<span class="relative">持ち物リスト</span>
						</button>

						<button
							class="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-sm
							       transition-all duration-300 overflow-hidden
							       {activeTab === 'budget'
								? 'text-accent-text bg-gradient-to-r from-accent to-accent-secondary shadow-lg scale-105'
								: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}"
							on:click={() => (activeTab = "budget")}
						>
							{#if activeTab !== "budget"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/5 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
							{/if}

							{#if activeTab === "budget"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-bg-primary/10 to-bg-primary/20
								            animate-pulse rounded-xl"
								></div>
							{/if}

							<Calculator class="relative w-5 h-5" />
							<span class="relative">予算管理</span>
						</button>

						<button
							class="group relative flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-sm
							       transition-all duration-300 overflow-hidden
							       {activeTab === 'chat'
								? 'text-accent-text bg-gradient-to-r from-accent to-accent-secondary shadow-lg scale-105'
								: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'}"
							on:click={() => (activeTab = "chat")}
						>
							{#if activeTab !== "chat"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/5 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
							{/if}

							{#if activeTab === "chat"}
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-bg-primary/10 to-bg-primary/20
								            animate-pulse rounded-xl"
								></div>
							{/if}

							<MessageCircle class="relative w-5 h-5" />
							<span class="relative">AI相談</span>
						</button>
					</div>
				</div>
				<div class="flex justify-end mt-4 space-x-4">
					<ItineraryThemeSelector />
					<ThemeSelector />
					<button
						class="group relative overflow-hidden p-4 bg-bg-secondary/80 border border-border/50
						       rounded-2xl hover:bg-bg-tertiary hover:border-border-hover transition-all duration-300
						       shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 backdrop-blur-sm"
						aria-label="members"
					>
						<div
							class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/10 to-bg-primary/0
						            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
						            transition-transform duration-700"
						></div>
						<Users
							class="relative w-6 h-6 text-text-secondary group-hover:text-text-primary transition-colors duration-200"
						/>
					</button>
					<button
						on:click={() => (showSettingsModal = true)}
						class="group relative overflow-hidden p-4 bg-bg-secondary/80 border border-border/50
						       rounded-2xl hover:bg-bg-tertiary hover:border-border-hover transition-all duration-300
						       shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 backdrop-blur-sm"
						aria-label="settings"
					>
						<div
							class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/10 to-bg-primary/0
						            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
						            transition-transform duration-700"
						></div>
						<Settings
							class="relative w-6 h-6 text-text-secondary group-hover:text-text-primary
						                 group-hover:rotate-90 transition-all duration-500"
						/>
					</button>
				</div>
			</div>
		</nav>

		<!-- Mobile bottom nav (only visible on small screens) -->
		<div
			class="fixed bottom-0 left-0 right-0 bg-card-bg/95 border-t border-card-border backdrop-blur-lg p-2 justify-around z-20 sm:hidden flex"
			role="navigation"
			aria-label="mobile tabs"
		>
			<button
				type="button"
				class="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 text-xs
					   {activeTab === 'timeline'
					? 'text-primary bg-primary/10'
					: 'text-text-secondary hover:text-primary hover:bg-primary/10'}"
				aria-current={activeTab === "timeline"}
				on:click={() => (activeTab = "timeline")}
			>
				<Calendar class="w-5 h-5" />
				<div>タイムライン</div>
			</button>
			<button
				type="button"
				class="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 text-xs
					   {activeTab === 'packing'
					? 'text-primary bg-primary/10'
					: 'text-text-secondary hover:text-primary hover:bg-primary/10'}"
				aria-current={activeTab === "packing"}
				on:click={() => (activeTab = "packing")}
			>
				<Package class="w-5 h-5" />
				<div>持ち物</div>
			</button>
			<button
				type="button"
				class="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 text-xs
					   {activeTab === 'budget'
					? 'text-primary bg-primary/10'
					: 'text-text-secondary hover:text-primary hover:bg-primary/10'}"
				aria-current={activeTab === "budget"}
				on:click={() => (activeTab = "budget")}
			>
				<Calculator class="w-5 h-5" />
				<div>予算</div>
			</button>
			<button
				type="button"
				class="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 text-xs
					   {activeTab === 'chat'
					? 'text-primary bg-primary/10'
					: 'text-text-secondary hover:text-primary hover:bg-primary/10'}"
				aria-current={activeTab === "chat"}
				on:click={() => (activeTab = "chat")}
			>
				<MessageCircle class="w-5 h-5" />
				<div>AI相談</div>
			</button>
			<button
				type="button"
				class="flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 text-xs
					   text-text-secondary hover:text-primary hover:bg-primary/10"
				on:click={() => (showSettingsModal = true)}
			>
				<Settings class="w-5 h-5" />
				<div>設定</div>
			</button>
		</div>

		<!-- コンテンツエリア -->
		<div
			class="max-w-2xl mx-auto px-4 py-8 pb-24 sm:pb-8"
			style="max-width: 640px;"
		>
			{#if activeTab === "timeline"}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-xl sm:text-2xl font-bold text-text-primary">
								タイムライン
							</h2>
							<p class="text-sm sm:text-base text-text-secondary mt-1">
								旅行の予定を時系列で管理しましょう
							</p>
						</div>
						<button
							on:click={() => openAddModal("timeline")}
							class="group relative overflow-hidden px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary via-primary to-primary-hover
							       hover:from-primary-hover hover:via-primary hover:to-primary text-primary-text rounded-xl sm:rounded-2xl
							       transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
							       border border-primary/20 backdrop-blur-sm text-sm sm:text-base"
						>
							<!-- 光沢エフェクト -->
							<div
								class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/20 to-bg-primary/0
							            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
							            transition-transform duration-700"
							></div>

							<div class="relative flex items-center space-x-2 sm:space-x-3">
								<div class="p-0.5 sm:p-1 bg-bg-primary/20 rounded-lg">
									<Plus class="w-4 h-4 sm:w-5 sm:h-5" />
								</div>
								<span class="font-semibold hidden sm:inline">予定を追加</span>
								<span class="font-semibold sm:hidden">追加</span>
							</div>
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
							<h2 class="text-xl sm:text-2xl font-bold text-text-primary">
								持ち物リスト
							</h2>
							<p class="text-sm sm:text-base text-text-secondary mt-1">
								必要なアイテムをチェックリストで管理
							</p>
						</div>
						<button
							on:click={() => openAddModal("packing")}
							class="group relative overflow-hidden px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary via-primary to-primary-hover
							       hover:from-primary-hover hover:via-primary hover:to-primary text-primary-text rounded-xl sm:rounded-2xl
							       transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
							       border border-primary/20 backdrop-blur-sm text-sm sm:text-base"
						>
							<div
								class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/20 to-bg-primary/0
							            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
							            transition-transform duration-700"
							></div>

							<div class="relative flex items-center space-x-2 sm:space-x-3">
								<div class="p-0.5 sm:p-1 bg-bg-primary/20 rounded-lg">
									<Plus class="w-4 h-4 sm:w-5 sm:h-5" />
								</div>
								<span class="font-semibold hidden sm:inline"
									>アイテムを追加</span
								>
								<span class="font-semibold sm:hidden">追加</span>
							</div>
						</button>
					</div>

					<div
						class="bg-card-bg border border-card-border rounded-2xl shadow-custom-lg overflow-hidden backdrop-blur-lg"
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
							<h2 class="text-xl sm:text-2xl font-bold text-text-primary">
								予算管理
							</h2>
							<p class="text-sm sm:text-base text-text-secondary mt-1">
								旅行費用の計画と実績を管理しましょう
							</p>
						</div>
						<button
							on:click={() => openAddModal("budget")}
							class="group relative overflow-hidden px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary via-primary to-primary-hover
							       hover:from-primary-hover hover:via-primary hover:to-primary text-primary-text rounded-xl sm:rounded-2xl
							       transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
							       border border-primary/20 backdrop-blur-sm text-sm sm:text-base"
						>
							<div
								class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/20 to-bg-primary/0
							            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
							            transition-transform duration-700"
							></div>

							<div class="relative flex items-center space-x-2 sm:space-x-3">
								<div class="p-0.5 sm:p-1 bg-bg-primary/20 rounded-lg">
									<Plus class="w-4 h-4 sm:w-5 sm:h-5" />
								</div>
								<span class="font-semibold hidden sm:inline">費用を追加</span>
								<span class="font-semibold sm:hidden">追加</span>
							</div>
						</button>
					</div>

					<div
						class="bg-card-bg border border-card-border rounded-2xl shadow-custom-lg overflow-hidden backdrop-blur-lg"
					>
						<BudgetList {budgetItems} on:edit={(e) => startEditing(e.detail)} />
					</div>
				</div>
			{:else if activeTab === "chat"}
				<div class="space-y-6">
					<div>
						<h2 class="text-xl sm:text-2xl font-bold text-text-primary">
							AI旅行相談
						</h2>
						<p class="text-sm sm:text-base text-text-secondary mt-1">
							AIと一緒に旅行プランを最適化しましょう
						</p>
					</div>
					<div
						class="bg-card-bg border border-card-border rounded-2xl shadow-custom-lg p-6 backdrop-blur-lg"
					>
						<AIChat {itineraryId} />
					</div>
				</div>
			{/if}
		</div>

		<!-- 編集モーダル -->
		{#if isEditing && editingItem}
			<div
				class="fixed inset-0 bg-bg-primary/60 backdrop-blur-sm flex items-center justify-center z-20 p-4"
			>
				<div
					class="bg-card-bg border border-card-border rounded-3xl shadow-custom-lg w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-lg"
				>
					<div class="p-8">
						<div class="flex justify-between items-center mb-6">
							<h3
								class="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
							>
								編集
							</h3>
							<button
								on:click={cancelEditing}
								class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-xl transition-all duration-200"
							>
								<X class="w-6 h-6" />
							</button>
						</div>

						<div class="space-y-4">
							<div>
								<label
									for="edit-input"
									class="block text-sm font-medium text-text-primary mb-2"
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
										class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
										       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
										       focus:ring-accent/20 transition-all duration-300 text-text-primary
										       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
										       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
										placeholder="イベントのタイトルを入力..."
									/>
								{:else if activeTab === "packing"}
									<input
										id="edit-input"
										type="text"
										bind:value={editingItem.item_name}
										class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
										       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
										       focus:ring-accent/20 transition-all duration-300 text-text-primary
										       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
										       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
										placeholder="アイテム名を入力..."
									/>
								{:else if activeTab === "budget"}
									<input
										id="edit-input"
										type="text"
										bind:value={editingItem.item_name}
										class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
										       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
										       focus:ring-accent/20 transition-all duration-300 text-text-primary
										       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
										       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
										placeholder="項目名を入力..."
									/>
								{/if}
							</div>

							{#if activeTab === "timeline"}
								<div>
									<label
										for="edit-description"
										class="block text-sm font-medium text-text-primary mb-2"
									>
										説明
									</label>
									<textarea
										id="edit-description"
										bind:value={editingItem.description}
										rows="3"
										class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
										       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
										       focus:ring-accent/20 transition-all duration-300 text-text-primary
										       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
										       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary resize-none"
										placeholder="イベントの詳細説明を入力..."
									></textarea>
								</div>

								<div>
									<label
										for="edit-location"
										class="block text-sm font-medium text-text-primary mb-2"
									>
										場所
									</label>
									<input
										id="edit-location"
										type="text"
										bind:value={editingItem.location_name}
										class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
										       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
										       focus:ring-accent/20 transition-all duration-300 text-text-primary
										       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
										       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
										placeholder="場所名を入力..."
									/>
								</div>

								<div>
									<label
										for="edit-datetime"
										class="block text-sm font-medium text-text-primary mb-2"
									>
										日時
									</label>
									<input
										id="edit-datetime"
										type="datetime-local"
										value={formatDateTimeForInput(editingItem.start_datetime)}
										on:input={(e) =>
											(editingItem.start_datetime = parseDateTimeFromInput(
												(e.target as HTMLInputElement).value,
											))}
										class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
											   border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
											   focus:ring-accent/20 transition-all duration-300 text-text-primary
											   backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
											   focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
									/>
								</div>
							{/if}
						</div>

						<div class="flex justify-end space-x-4 mt-8">
							<button
								on:click={cancelEditing}
								class="group relative overflow-hidden px-8 py-4 text-text-secondary border border-border/50
								       rounded-2xl hover:bg-bg-tertiary hover:border-border-hover transition-all duration-300
								       font-semibold backdrop-blur-sm hover:text-text-primary shadow-lg hover:shadow-xl"
							>
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/5 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
								<span class="relative">キャンセル</span>
							</button>
							<button
								on:click={saveItem}
								class="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-accent to-accent-secondary
								       hover:from-accent-hover hover:to-accent text-accent-text rounded-2xl transition-all duration-300
								       shadow-lg hover:shadow-xl font-semibold flex items-center space-x-3 transform hover:scale-105 active:scale-95"
							>
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/20 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
								<Save class="relative w-5 h-5" />
								<span class="relative">保存</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- 設定モーダル -->
		{#if showSettingsModal}
			<div
				class="fixed inset-0 bg-bg-primary/60 backdrop-blur-sm flex items-center justify-center z-30 p-4"
			>
				<div
					class="bg-card-bg border border-card-border rounded-3xl shadow-custom-lg w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-lg"
				>
					<div class="p-8">
						<div class="flex justify-between items-center mb-6">
							<h3
								class="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
							>
								設定
							</h3>
							<button
								on:click={closeSettingsModal}
								class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-xl transition-all duration-200"
							>
								<X class="w-6 h-6" />
							</button>
						</div>

						<div class="space-y-6">
							<!-- テーマ設定 -->
							<div class="space-y-3">
								<h4
									class="text-lg font-semibold text-text-primary flex items-center gap-2"
								>
									<Palette class="w-5 h-5" />
									アプリテーマ
								</h4>
								<div
									class="bg-bg-secondary/50 p-4 rounded-2xl border border-border/30"
								>
									<ThemeSelector />
								</div>
							</div>

							<!-- しおりテーマ設定 -->
							<div class="space-y-3">
								<h4
									class="text-lg font-semibold text-text-primary flex items-center gap-2"
								>
									<Palette class="w-5 h-5" />
									しおりテーマ
								</h4>
								<div
									class="bg-bg-secondary/50 p-4 rounded-2xl border border-border/30"
								>
									<ItineraryThemeSelector />
								</div>
							</div>

							<!-- メンバー管理 -->
							<div class="space-y-3">
								<h4
									class="text-lg font-semibold text-text-primary flex items-center gap-2"
								>
									<Users class="w-5 h-5" />
									メンバー管理
								</h4>
								<div
									class="bg-bg-secondary/50 p-4 rounded-2xl border border-border/30"
								>
									<p class="text-text-secondary text-sm">
										メンバー機能は近日公開予定です
									</p>
								</div>
							</div>
						</div>

						<div class="flex justify-end mt-8">
							<button
								on:click={closeSettingsModal}
								class="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-accent to-accent-secondary
								       hover:from-accent-hover hover:to-accent text-accent-text rounded-2xl transition-all duration-300
								       shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
							>
								<div
									class="absolute inset-0 bg-gradient-to-r from-bg-primary/0 via-bg-primary/20 to-bg-primary/0
								            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
								            transition-transform duration-700"
								></div>
								<span class="relative">完了</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- フローティングアクションボタン（スマホ時は非表示）-->
		<button
			on:click={() => openAddModal("timeline")}
			class="hidden sm:flex fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-primary-hover text-primary-text rounded-full shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-110 active:scale-95 z-20 items-center justify-center group"
			aria-label="予定を追加"
		>
			<Plus class="w-6 h-6 transition-transform group-hover:rotate-90" />
		</button>

		<!-- 追加アイテムモーダル -->
		{#if showAddModal}
			<QuickAddModal
				bind:isOpen={showAddModal}
				type={addModalType}
				on:save={handleAddItem}
			/>
		{/if}
	{/if}
</main>
