<script lang="ts">
	import { generateId } from "$lib/utils";
	import { goto } from "$app/navigation";
	import { BookOpen, Sparkles } from "lucide-svelte";
	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";
	import Textarea from "$lib/components/Textarea.svelte";

	let title = "";
	let description = "";
	let editPassword = "";
	let isCreating = false;

	const createItinerary = async () => {
		if (!title.trim()) return;

		isCreating = true;
		try {
			const response = await fetch("/api/itineraries", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title,
					description,
					password: editPassword,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create itinerary");
			}

			const data = await response.json();
			await goto(`/itinerary/${data.id}`);
		} catch (error) {
			console.error("Failed to create itinerary:", error);
			alert("しおりの作成に失敗しました。再度お試しください。");
		} finally {
			isCreating = false;
		}
	};

	const accessItinerary = (id: string) => {
		goto(`/itinerary/${id}`);
	};
</script>

<main class="min-h-screen">
	<!-- ヒーローセクション -->
	<section class="section">
		<div class="container">
			<div class="text-center mb-12">
				<div class="flex justify-center mb-6">
					<div class="bg-primary text-primary-text rounded-xl p-4">
						<BookOpen class="w-12 h-12" />
					</div>
				</div>
				<h1 class="text-4xl md:text-5xl font-bold text-gradient mb-4">
					AxI-itinerary
				</h1>
				<p class="text-xl text-secondary mb-4">
					AIと一緒に育てる、みんなの旅日記
				</p>
				<p class="text-muted max-w-2xl mx-auto">
					計画から思い出まで、一緒に作り上げる新しい旅行体験
				</p>
			</div>

			<!-- メインコンテンツ -->
			<div class="max-w-2xl mx-auto">
				<div class="card">
					<div class="text-center mb-6">
						<h2 class="text-2xl font-bold text-gradient mb-2">
							新しい旅の始まり
						</h2>
						<p class="text-secondary">
							あなたの特別な旅行をしおりにまとめましょう
						</p>
					</div>

					<form on:submit|preventDefault={createItinerary} class="space-y-6">
						<Input
							id="title"
							label="旅行タイトル"
							placeholder="例: 京都の桜巡り、北海道の絶景旅..."
							bind:value={title}
							required
						/>

						<Textarea
							id="description"
							label="旅行の概要"
							placeholder="旅行の目的やテーマ、期待することなど..."
							bind:value={description}
							rows={3}
						/>

						<Input
							id="password"
							type="password"
							label="編集パスワード"
							placeholder="共同編集を制限する場合に設定"
							bind:value={editPassword}
							help="他の人による編集を制限したい場合に設定してください"
						/>

						<Button
							type="submit"
							variant="primary"
							size="lg"
							fullWidth
							disabled={isCreating || !title.trim()}
						>
							{#if isCreating}
								<span>作成中...</span>
							{:else}
								<Sparkles class="w-5 h-5" />
								<span>しおりを作成</span>
							{/if}
						</Button>
					</form>
				</div>
			</div>
		</div>
	</section>

	<!-- 機能紹介セクション -->
	<section class="section bg-secondary">
		<div class="container">
			<div class="text-center mb-12">
				<h2 class="text-3xl font-bold mb-4">主な機能</h2>
				<p class="text-secondary max-w-2xl mx-auto">
					旅行の計画から記録まで、すべてを一つの場所で管理できます
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="card">
					<div class="flex items-start gap-4">
						<div
							class="bg-primary text-primary-text rounded-lg p-2 flex-shrink-0"
						>
							<BookOpen class="w-6 h-6" />
						</div>
						<div>
							<h3 class="font-semibold mb-2">タイムライン管理</h3>
							<p class="text-secondary text-sm">
								時系列で予定を整理し、詳細情報を記録
							</p>
						</div>
					</div>
				</div>

				<div class="card">
					<div class="flex items-start gap-4">
						<div
							class="bg-secondary text-secondary-text rounded-lg p-2 flex-shrink-0"
						>
							<Sparkles class="w-6 h-6" />
						</div>
						<div>
							<h3 class="font-semibold mb-2">共同編集</h3>
							<p class="text-secondary text-sm">
								友人や家族と一緒にリアルタイムで編集
							</p>
						</div>
					</div>
				</div>

				<div class="card">
					<div class="flex items-start gap-4">
						<div
							class="bg-success text-success-text rounded-lg p-2 flex-shrink-0"
						>
							<BookOpen class="w-6 h-6" />
						</div>
						<div>
							<h3 class="font-semibold mb-2">予算管理</h3>
							<p class="text-secondary text-sm">費用計算と分割、清算機能</p>
						</div>
					</div>
				</div>

				<div class="card">
					<div class="flex items-start gap-4">
						<div
							class="bg-warning text-warning-text rounded-lg p-2 flex-shrink-0"
						>
							<Sparkles class="w-6 h-6" />
						</div>
						<div>
							<h3 class="font-semibold mb-2">AI旅行相談</h3>
							<p class="text-secondary text-sm">
								AIとチャットして旅行プランを最適化
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- アクセスセクション -->
	<section class="section">
		<div class="container">
			<div class="max-w-2xl mx-auto">
				<div class="card text-center">
					<h2 class="text-2xl font-bold text-gradient mb-4">
						既存のしおりにアクセス
					</h2>
					<p class="text-secondary mb-6">
						しおりのURLを持っている場合は、直接アクセスできます
					</p>
					<Button variant="secondary" href="/my-itineraries">
						マイしおり一覧
					</Button>
				</div>
			</div>
		</div>
	</section>
</main>
