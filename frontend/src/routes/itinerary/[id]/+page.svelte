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

<main class="min-h-screen bg-gray-50">
	{#if isLoading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-xl text-gray-600">読み込み中...</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-xl text-red-600">エラー: {error}</div>
		</div>
	{:else}
		<!-- ヘッダー -->
		<header class="bg-white shadow-sm border-b">
			<div class="max-w-7xl mx-auto px-4 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-2xl font-bold text-gray-900">{itinerary.title}</h1>
						{#if itinerary.description}
							<p class="text-gray-600 mt-1">{itinerary.description}</p>
						{/if}
					</div>
					<div class="flex items-center space-x-2">
						<button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
							<Users class="w-5 h-5" />
						</button>
						<button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
							<Settings class="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- タブナビゲーション -->
		<nav class="bg-white border-b">
			<div class="max-w-7xl mx-auto px-4">
				<div class="flex space-x-8">
					<button
						class="py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						on:click={() => activeTab = 'timeline'}
					>
						<Calendar class="w-4 h-4 inline mr-2" />
						タイムライン
					</button>
					<button
						class="py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === 'packing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						on:click={() => activeTab = 'packing'}
					>
						<Package class="w-4 h-4 inline mr-2" />
						持ち物リスト
					</button>
					<button
						class="py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === 'budget' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						on:click={() => activeTab = 'budget'}
					>
						<Calculator class="w-4 h-4 inline mr-2" />
						予算管理
					</button>
					<button
						class="py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						on:click={() => activeTab = 'chat'}
					>
						<MessageCircle class="w-4 h-4 inline mr-2" />
						AI相談
					</button>
				</div>
			</div>
		</nav>

		<!-- コンテンツエリア -->
		<div class="max-w-7xl mx-auto px-4 py-6">
			{#if activeTab === 'timeline'}
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<h2 class="text-xl font-semibold">タイムライン</h2>
						<button
							on:click={() => openAddModal('timeline')}
							class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
						>
							<Plus class="w-4 h-4 mr-2" />
							予定を追加
						</button>
					</div>

					<div class="space-y-3">
						{#each timelineItems as item}
							<div class="bg-white rounded-lg shadow-sm border p-4">
								<div class="flex justify-between items-start">
									<div class="flex-1">
										<div class="flex items-center space-x-2 mb-2">
											<h3 class="font-semibold text-gray-900">{item.title}</h3>
											<span class="text-sm text-gray-500">{formatDateTime(item.start_datetime)}</span>
										</div>
										{#if item.description}
											<p class="text-gray-600 mb-2">{item.description}</p>
										{/if}
										{#if item.location_name}
											<p class="text-sm text-blue-600">📍 {item.location_name}</p>
										{/if}
									</div>
									<button
										class="p-2 text-gray-400 hover:text-gray-600 rounded-md"
										on:click={() => startEditing(item)}
									>
										<Edit3 class="w-4 h-4" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'packing'}
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<h2 class="text-xl font-semibold">持ち物リスト</h2>
						<button
							on:click={() => openAddModal('packing')}
							class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
						>
							<Plus class="w-4 h-4 mr-2" />
							アイテムを追加
						</button>
					</div>

					<div class="bg-white rounded-lg shadow-sm border">
						{#each packingItems as item}
							<div class="flex items-center justify-between p-4 border-b last:border-b-0">
								<div class="flex items-center space-x-3">
									<input
										type="checkbox"
										bind:checked={item.is_checked}
										class="w-4 h-4 text-green-600 rounded focus:ring-green-500"
									/>
									<div class:line-through={item.is_checked} class:text-gray-500={item.is_checked}>
										<span class="font-medium">{item.item_name}</span>
										{#if item.category}
											<span class="text-sm text-gray-500 ml-2">({item.category})</span>
										{/if}
										<span class="text-sm text-gray-500 ml-2">× {item.quantity}</span>
									</div>
								</div>
								<button
									class="p-2 text-gray-400 hover:text-gray-600 rounded-md"
									on:click={() => startEditing(item)}
								>
									<Edit3 class="w-4 h-4" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'budget'}
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<h2 class="text-xl font-semibold">予算管理</h2>
						<button
							on:click={() => openAddModal('budget')}
							class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
						>
							<Plus class="w-4 h-4 mr-2" />
							費用を追加
						</button>
					</div>

					<div class="bg-white rounded-lg shadow-sm border">
						{#each budgetItems as item}
							<div class="flex items-center justify-between p-4 border-b last:border-b-0">
								<div>
									<div class="font-medium">{item.item_name}</div>
									<div class="text-sm text-gray-500">{item.category}</div>
								</div>
								<div class="text-right">
									<div class="font-medium">
										予算: {item.planned_amount ? formatCurrency(item.planned_amount) : '未設定'}
									</div>
									{#if item.actual_amount}
										<div class="text-sm {item.actual_amount > (item.planned_amount || 0) ? 'text-red-600' : 'text-green-600'}">
											実費: {formatCurrency(item.actual_amount)}
										</div>
									{/if}
								</div>
								<button
									class="p-2 text-gray-400 hover:text-gray-600 rounded-md"
									on:click={() => startEditing(item)}
								>
									<Edit3 class="w-4 h-4" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{:else if activeTab === 'chat'}
				<div class="space-y-4">
					<h2 class="text-xl font-semibold">AI旅行相談</h2>
					<AIChat itineraryId={itineraryId} />
				</div>
			{/if}
		</div>

		<!-- 編集モーダル -->
		{#if isEditing && editingItem}
			<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-semibold">編集</h3>
						<button on:click={cancelEditing} class="text-gray-400 hover:text-gray-600">
							<X class="w-5 h-5" />
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
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							{:else if activeTab === 'packing'}
								<input
									type="text"
									bind:value={editingItem.item_name}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							{:else if activeTab === 'budget'}
								<input
									type="text"
									bind:value={editingItem.item_name}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							{/if}
						</div>
					</div>

					<div class="flex justify-end space-x-2 mt-6">
						<button
							on:click={cancelEditing}
							class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							キャンセル
						</button>
						<button
							on:click={saveItem}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
						>
							<Save class="w-4 h-4 mr-2" />
							保存
						</button>
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
