<script lang="ts">
	import { generateId } from "$lib/utils";
	import { goto } from "$app/navigation";
	import {
		Plus,
		BookOpen,
		Users,
		Calculator,
		MessageCircle,
		Sparkles,
		MapPin,
		Heart,
	} from "lucide-svelte";

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

<main class="min-h-screen page-bg-hero">
	<!-- ヒーローセクション -->
	<section class="relative overflow-hidden page-bg-section">
		<div
			class="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"
		></div>
		<div class="relative container mx-auto px-4 py-12 md:py-20 max-w-6xl">
			<div class="text-center mb-16">
				<div
					class="inline-flex items-center justify-center w-20 h-20 icon-theme-container mb-8 animate-theme-float"
				>
					<BookOpen class="w-10 h-10 text-white" />
				</div>
				<h1
					class="text-4xl md:text-5xl lg:text-6xl font-bold text-theme-gradient mb-6"
				>
					AxI-itinerary
				</h1>
				<p
					class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 font-light"
				>
					AIと一緒に育てる、みんなの旅日記
				</p>
				<p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
					計画から思い出まで、一緒に作り上げる新しい旅行体験
				</p>
			</div>

			<!-- メインアクションカード -->
			<div class="max-w-6xl mx-auto">
				<div class="card p-6 md:p-12 animate-bounce-in">
					<div class="grid-responsive gap-8 lg:gap-12 items-center">
						<!-- しおり作成フォーム -->
						<div class="space-y-6">
							<div>
								<h2 class="text-2xl font-bold text-gradient mb-2">
									新しい旅の始まり
								</h2>
								<p class="text-gray-600 dark:text-gray-300">
									あなたの特別な旅行をしおりにまとめましょう
								</p>
							</div>

							<form
								on:submit|preventDefault={createItinerary}
								class="space-y-5"
							>
								<div class="space-y-2">
									<label
										for="title"
										class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
									>
										旅行タイトル <span class="text-red-500">*</span>
									</label>
									<input
										id="title"
										type="text"
										bind:value={title}
										placeholder="例: 京都の桜巡り、北海道の絶景旅..."
										class="input-field"
										required
									/>
								</div>

								<div class="space-y-2">
									<label
										for="description"
										class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
									>
										旅行の概要
									</label>
									<textarea
										id="description"
										bind:value={description}
										placeholder="旅行の目的やテーマ、期待することなど..."
										rows="3"
										class="input-field resize-none"
									></textarea>
								</div>

								<div class="space-y-2">
									<label
										for="password"
										class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
									>
										編集パスワード
									</label>
									<input
										id="password"
										type="password"
										bind:value={editPassword}
										placeholder="共同編集を制限する場合に設定"
										class="input-field"
									/>
								</div>

								<button
									type="submit"
									disabled={!title.trim() || isCreating}
									class="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{#if isCreating}
										<div
											class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
										></div>
										<span>作成中...</span>
									{:else}
										<Sparkles class="w-5 h-5" />
										<span>しおりを作成</span>
									{/if}
								</button>
							</form>
						</div>

						<!-- 機能紹介 -->
						<div class="space-y-6">
							<div>
								<h3
									class="text-xl font-bold text-gray-900 dark:text-white mb-4"
								>
									主な機能
								</h3>
								<div class="space-y-4">
									<div
										class="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-transparent to-white/10 dark:from-transparent dark:to-white/5 rounded-xl border-theme-glow hover-theme-lift"
									>
										<div class="icon-theme-container flex-shrink-0 shadow-sm">
											<MapPin class="w-5 h-5 text-white" />
										</div>
										<div>
											<h4 class="font-semibold text-gray-900 dark:text-white">
												タイムライン管理
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-300">
												時系列で予定を整理し、詳細情報を記録
											</p>
										</div>
									</div>

									<div
										class="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-transparent to-white/10 dark:from-transparent dark:to-white/5 rounded-xl border-theme-glow hover-theme-lift"
									>
										<div class="icon-theme-container flex-shrink-0 shadow-sm">
											<Users class="w-5 h-5 text-white" />
										</div>
										<div>
											<h4 class="font-semibold text-gray-900 dark:text-white">
												共同編集
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-300">
												友人や家族と一緒にリアルタイムで編集
											</p>
										</div>
									</div>

									<div
										class="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-transparent to-white/10 dark:from-transparent dark:to-white/5 rounded-xl border-theme-glow hover-theme-lift"
									>
										<div class="icon-theme-container flex-shrink-0 shadow-sm">
											<Calculator class="w-5 h-5 text-white" />
										</div>
										<div>
											<h4 class="font-semibold text-gray-900 dark:text-white">
												予算管理
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-300">
												費用計算と分割、清算機能
											</p>
										</div>
									</div>

									<div
										class="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-transparent to-white/10 dark:from-transparent dark:to-white/5 rounded-xl border-theme-glow hover-theme-lift"
									>
										<div class="icon-theme-container flex-shrink-0 shadow-sm">
											<MessageCircle class="w-5 h-5 text-white" />
										</div>
										<div>
											<h4 class="font-semibold text-gray-900 dark:text-white">
												AI旅行相談
											</h4>
											<p class="text-sm text-gray-600 dark:text-gray-300">
												AIとチャットして旅行プランを最適化
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- アクセスセクション -->
	<section class="py-16">
		<div class="container mx-auto px-4 max-w-4xl">
			<div class="card border-theme-glow p-8 animate-slide-up page-bg-section">
				<div class="text-center mb-8">
					<Heart
						class="w-8 h-8 text-amber-600 mx-auto mb-4 animate-theme-pulse"
					/>
					<h2 class="text-2xl font-bold text-theme-gradient mb-2">
						既存のしおりにアクセス
					</h2>
					<p class="text-gray-600 dark:text-gray-300">
						しおりのURLを持っている場合は、直接アクセスできます
					</p>
				</div>
			</div>
		</div>
	</section>
</main>
