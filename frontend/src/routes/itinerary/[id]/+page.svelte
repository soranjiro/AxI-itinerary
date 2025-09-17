<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
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
		X
	} from 'lucide-svelte';
	import AIChat from '$lib/components/AIChat.svelte';
	import AddItemModal from '$lib/components/AddItemModal.svelte';

	const itineraryId = $page.params.id;

	let activeTab = 'timeline';
	let isLoading = true;
	let error = '';

	// ダミーデータ
	let itinerary = {
		id: itineraryId,
		title: 'サンプル旅行',
		description: 'これはサンプルの旅行しおりです',
		theme: 'simple'
	};

	let timelineItems = [
		{
			id: '1',
			title: '新宿駅出発',
			description: '友人と待ち合わせ',
			start_datetime: '2025-01-15T09:00:00',
			location_name: '新宿駅',
			sort_order: 1
		},
		{
			id: '2',
			title: '京都到着',
			description: '新幹線で移動',
			start_datetime: '2025-01-15T12:00:00',
			location_name: '京都駅',
			sort_order: 2
		}
	];

	let packingItems = [
		{ id: '1', item_name: '着替え', category: '衣類', quantity: 3, is_checked: false },
		{ id: '2', item_name: '充電器', category: '電子機器', quantity: 1, is_checked: true },
		{ id: '3', item_name: 'パスポート', category: '書類', quantity: 1, is_checked: false }
	];

	let budgetItems = [
		{ id: '1', category: '交通費', item_name: '新幹線代', planned_amount: 15000, actual_amount: null },
		{ id: '2', category: '宿泊費', item_name: 'ホテル代', planned_amount: 8000, actual_amount: 8500 },
		{ id: '3', category: '食費', item_name: '夕食', planned_amount: 3000, actual_amount: null }
	];

	let editingItem: any = null;
	let isEditing = false;
	let showAddModal = false;
	let addModalType: 'timeline' | 'packing' | 'budget' = 'timeline';

	onMount(() => {
		// TODO: 実際のAPI呼び出し
		setTimeout(() => {
			isLoading = false;
		}, 500);
	});

	const formatDateTime = (dateTime: string) => {
		return new Date(dateTime).toLocaleString('ja-JP', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY'
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
		console.log('保存:', editingItem);
		cancelEditing();
	};

	const openAddModal = (type: 'timeline' | 'packing' | 'budget') => {
		addModalType = type;
		showAddModal = true;
	};

	const handleAddItem = (event: CustomEvent) => {
		const newItem = event.detail;
		console.log('新しいアイテム:', newItem);

		// TODO: 実際のAPI呼び出し
		if (addModalType === 'timeline') {
			const timelineItem = {
				id: Date.now().toString(),
				...newItem,
				sort_order: timelineItems.length + 1
			};
			timelineItems = [...timelineItems, timelineItem];
		} else if (addModalType === 'packing') {
			const packingItem = {
				id: Date.now().toString(),
				...newItem,
				is_checked: false
			};
			packingItems = [...packingItems, packingItem];
		} else if (addModalType === 'budget') {
			const budgetItem = {
				id: Date.now().toString(),
				...newItem,
				actual_amount: null
			};
			budgetItems = [...budgetItems, budgetItem];
		}
	};
</script>

<main class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
	{#if isLoading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
				<div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
				<p class="text-xl text-gray-600 dark:text-gray-300 text-center">読み込み中...</p>
			</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center min-h-screen">
			<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
				<div class="text-center">
					<div class="text-6xl mb-4">⚠️</div>
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">エラーが発生しました</h2>
					<p class="text-gray-600 dark:text-gray-300">{error}</p>
				</div>
			</div>
		</div>
	{:else}
		<!-- ページ固有ヘッダー -->
		<header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
			<div class="max-w-7xl mx-auto px-4 py-6">
				<div class="flex items-center justify-between">
					<div class="flex-1">
						<h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
							{itinerary.title}
						</h1>
						{#if itinerary.description}
							<p class="text-gray-600 dark:text-gray-300 text-lg">{itinerary.description}</p>
						{/if}
					</div>
					<div class="flex items-center space-x-3">
						<button class="p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 transform hover:scale-105">
							<Users class="w-6 h-6" />
						</button>
						<button class="p-3 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 transform hover:scale-105">
							<Settings class="w-6 h-6" />
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- タブナビゲーション -->
		<nav class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex space-x-1">
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab === 'timeline' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => activeTab = 'timeline'}
					>
						<Calendar class="w-5 h-5" />
						<span>タイムライン</span>
					</button>
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab === 'packing' ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => activeTab = 'packing'}
					>
						<Package class="w-5 h-5" />
						<span>持ち物リスト</span>
					</button>
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab === 'budget' ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => activeTab = 'budget'}
					>
						<Calculator class="w-5 h-5" />
						<span>予算管理</span>
					</button>
					<button
						class="flex items-center space-x-2 py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg {activeTab === 'chat' ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'}"
						on:click={() => activeTab = 'chat'}
					>
						<MessageCircle class="w-5 h-5" />
						<span>AI相談</span>
					</button>
				</div>
			</div>
		</nav>

		<!-- コンテンツエリア -->
		<div class="max-w-7xl mx-auto px-4 py-8 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
			{#if activeTab === 'timeline'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">タイムライン</h2>
							<p class="text-gray-600 dark:text-gray-300 mt-1">旅行の予定を時系列で管理しましょう</p>
						</div>
						<button
							on:click={() => openAddModal('timeline')}
							class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
						>
							<Plus class="w-5 h-5" />
							<span>予定を追加</span>
						</button>
					</div>

					<div class="space-y-4">
						{#each timelineItems as item}
							<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<div class="flex items-center space-x-3 mb-3">
											<div class="w-3 h-3 bg-blue-500 rounded-full"></div>
											<h3 class="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
											<span class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
												{formatDateTime(item.start_datetime)}
											</span>
										</div>
										{#if item.description}
											<p class="text-gray-600 dark:text-gray-300 mb-3 text-lg">{item.description}</p>
										{/if}
										{#if item.location_name}
											<div class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
												<span class="text-lg">📍</span>
												<span class="font-medium">{item.location_name}</span>
											</div>
										{/if}
									</div>
									<button
										class="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 transform hover:scale-110"
										on:click={() => startEditing(item)}
									>
										<Edit3 class="w-6 h-6" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'packing'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">持ち物リスト</h2>
							<p class="text-gray-600 dark:text-gray-300 mt-1">必要なアイテムをチェックリストで管理しましょう</p>
						</div>
						<button
							on:click={() => openAddModal('packing')}
							class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
						>
							<Plus class="w-5 h-5" />
							<span>アイテムを追加</span>
						</button>
					</div>

					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
						{#each packingItems as item}
							<div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
								<div class="flex items-center space-x-4">
									<input
										type="checkbox"
										bind:checked={item.is_checked}
										class="w-6 h-6 text-green-600 dark:text-green-400 rounded-lg focus:ring-green-500 dark:focus:ring-green-400 border-2 border-gray-300 dark:border-gray-600 transition-colors"
									/>
									<div class:line-through={item.is_checked} class="transition-all duration-200" class:text-gray-500={item.is_checked} class:text-gray-400={item.is_checked}>
										<span class="text-lg font-semibold text-gray-900 dark:text-white">{item.item_name}</span>
										{#if item.category}
											<span class="text-sm text-gray-500 dark:text-gray-400 ml-3 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
												{item.category}
											</span>
										{/if}
										<span class="text-sm text-gray-500 dark:text-gray-400 ml-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
											× {item.quantity}
										</span>
									</div>
								</div>
								<button
									class="p-3 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 transform hover:scale-110"
									on:click={() => startEditing(item)}
								>
									<Edit3 class="w-6 h-6" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'budget'}
				<div class="space-y-6">
					<div class="flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-gray-900 dark:text-white">予算管理</h2>
							<p class="text-gray-600 dark:text-gray-300 mt-1">旅行費用の計画と実績を管理しましょう</p>
						</div>
						<button
							on:click={() => openAddModal('budget')}
							class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
						>
							<Plus class="w-5 h-5" />
							<span>費用を追加</span>
						</button>
					</div>

					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
						{#each budgetItems as item}
							<div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
								<div class="flex-1">
									<div class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.item_name}</div>
									<div class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block">
										{item.category}
									</div>
								</div>
								<div class="text-right mr-4">
									<div class="text-lg font-bold text-gray-900 dark:text-white mb-1">
										予算: {item.planned_amount ? formatCurrency(item.planned_amount) : '未設定'}
									</div>
									{#if item.actual_amount}
										<div class="text-sm font-medium {item.actual_amount > (item.planned_amount || 0) ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
											実費: {formatCurrency(item.actual_amount)}
											{#if item.planned_amount}
												<span class="ml-2">
													({item.actual_amount > item.planned_amount ? '+' : ''}{(item.actual_amount - item.planned_amount).toLocaleString()}円)
												</span>
											{/if}
										</div>
									{:else}
										<div class="text-sm text-gray-500 dark:text-gray-400">実費: 未入力</div>
									{/if}
								</div>
								<button
									class="p-3 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 transform hover:scale-110"
									on:click={() => startEditing(item)}
								>
									<Edit3 class="w-6 h-6" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'chat'}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">AI旅行相談</h2>
						<p class="text-gray-600 dark:text-gray-300 mt-1">AIと一緒に旅行プランを最適化しましょう</p>
					</div>
					<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
						<AIChat itineraryId={itineraryId} />
					</div>
				</div>
			{/if}
		</div>

		<!-- 編集モーダル -->
		{#if isEditing && editingItem}
			<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
				<div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
					<div class="p-8">
						<div class="flex justify-between items-center mb-6">
							<h3 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">編集</h3>
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
							<label class="block text-sm font-medium text-gray-700 mb-2">
								{#if activeTab === 'timeline'}タイトル
								{:else if activeTab === 'packing'}アイテム名
								{:else if activeTab === 'budget'}項目名{/if}
							</label>
							{#if activeTab === 'timeline'}
								<input
									type="text"
									bind:value={editingItem.title}
									class="input-field"
								/>
							{:else if activeTab === 'packing'}
								<input
									type="text"
									bind:value={editingItem.item_name}
									class="input-field"
								/>
							{:else if activeTab === 'budget'}
								<input
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
		<AddItemModal
			bind:isOpen={showAddModal}
			type={addModalType}
			on:save={handleAddItem}
		/>
	{/if}
</main>
