<script lang="ts">
	import { generateId } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { Plus, BookOpen, Users, Calculator, MessageCircle } from 'lucide-svelte';

	let title = '';
	let description = '';
	let editPassword = '';
	let isCreating = false;

	const createItinerary = async () => {
		if (!title.trim()) return;

		isCreating = true;
		try {
			const id = generateId();
			// TODO: API呼び出しでしおりを作成
			// 現在はダミーでID生成のみ
			await goto(`/itinerary/${id}`);
		} catch (error) {
			console.error('Failed to create itinerary:', error);
		} finally {
			isCreating = false;
		}
	};

	const accessItinerary = (id: string) => {
		goto(`/itinerary/${id}`);
	};
</script>

<main class="container mx-auto px-4 py-8 max-w-4xl">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-gray-800 mb-4">
			<BookOpen class="inline-block w-10 h-10 mr-3" />
			AxI-itinerary
		</h1>
		<p class="text-xl text-gray-600 mb-2">AIと一緒に育てる、みんなの旅日記</p>
		<p class="text-gray-500">計画から思い出まで、一緒に作り上げる新しい旅の体験</p>
	</div>

	<div class="grid md:grid-cols-2 gap-8 mb-12">
		<!-- しおり作成 -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-2xl font-semibold mb-4 text-gray-800">新しいしおりを作成</h2>
			<form on:submit|preventDefault={createItinerary} class="space-y-4">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
						旅行タイトル
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						placeholder="例: 京都春の旅"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
						説明（任意）
					</label>
					<textarea
						id="description"
						bind:value={description}
						placeholder="旅行の概要や目的を記入..."
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
				</div>
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						編集パスワード（任意）
					</label>
					<input
						id="password"
						type="password"
						bind:value={editPassword}
						placeholder="編集権限を制限したい場合に設定"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<button
					type="submit"
					disabled={!title.trim() || isCreating}
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{#if isCreating}
						作成中...
					{:else}
						<Plus class="w-5 h-5 mr-2" />
						しおりを作成
					{/if}
				</button>
			</form>
		</div>

		<!-- 機能紹介 -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-2xl font-semibold mb-4 text-gray-800">主な機能</h2>
			<div class="space-y-4">
				<div class="flex items-start space-x-3">
					<BookOpen class="w-6 h-6 text-blue-600 mt-1" />
					<div>
						<h3 class="font-semibold text-gray-800">タイムライン管理</h3>
						<p class="text-sm text-gray-600">時系列で予定を整理し、詳細情報を記録</p>
					</div>
				</div>
				<div class="flex items-start space-x-3">
					<Users class="w-6 h-6 text-green-600 mt-1" />
					<div>
						<h3 class="font-semibold text-gray-800">共同編集</h3>
						<p class="text-sm text-gray-600">友人や家族と一緒にリアルタイムで編集</p>
					</div>
				</div>
				<div class="flex items-start space-x-3">
					<Calculator class="w-6 h-6 text-purple-600 mt-1" />
					<div>
						<h3 class="font-semibold text-gray-800">予算管理</h3>
						<p class="text-sm text-gray-600">費用計算と分割、清算機能</p>
					</div>
				</div>
				<div class="flex items-start space-x-3">
					<MessageCircle class="w-6 h-6 text-orange-600 mt-1" />
					<div>
						<h3 class="font-semibold text-gray-800">AI旅行相談</h3>
						<p class="text-sm text-gray-600">AIとチャットして旅行プランを最適化</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- アクセス方法 -->
	<div class="bg-gray-50 rounded-lg p-6">
		<h2 class="text-xl font-semibold mb-4 text-gray-800">既存のしおりにアクセス</h2>
		<p class="text-gray-600 mb-4">
			しおりのURLを持っている場合は、直接アクセスできます。
			編集するには作成時に設定したパスワードが必要です。
		</p>
		<div class="flex space-x-2">
			<input
				type="text"
				placeholder="しおりのIDまたはURL"
				class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						const target = e.currentTarget as HTMLInputElement;
						const value = target.value.trim();
						if (value) {
							// URLの場合はIDを抽出、IDの場合はそのまま使用
							const id = value.includes('/') ? value.split('/').pop() || '' : value;
							if (id) accessItinerary(id);
						}
					}
				}}
			/>
			<button
				class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
				on:click={(e) => {
					const input = e.currentTarget.previousElementSibling as HTMLInputElement;
					const value = input.value.trim();
					if (value) {
						const id = value.includes('/') ? value.split('/').pop() || '' : value;
						if (id) accessItinerary(id);
					}
				}}
			>
				アクセス
			</button>
		</div>
	</div>
</main>

<style>
	:global(body) {
		background-color: #f9fafb;
		font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
	}
</style>
