<script lang="ts">
	import "../app.css";
	import Header from "$lib/components/Header.svelte";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";

	let { children } = $props();

	onMount(() => {
		// Service Workerの登録（PWA対応）
		if (browser && "serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("SW registered: ", registration);
				})
				.catch((registrationError) => {
					console.log("SW registration failed: ", registrationError);
				});
		}
	});
</script>

<svelte:head>
	<title>AxI-itinerary - AI旅行しおり作成ツール</title>
	<meta name="description" content="AIを活用した協調的な旅行しおり作成ツール" />
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1.0, viewport-fit=cover"
	/>
	<meta name="theme-color" content="#6366f1" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<meta name="apple-mobile-web-app-title" content="AxI-itinerary" />

	<link rel="icon" href="/favicon.ico" />
	<link rel="manifest" href="/manifest.json" />
	<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="min-h-screen flex flex-col transition-all duration-300 bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]"
>
	<!-- 固定ヘッダー -->
	<div class="sticky top-0 z-10">
		<Header />
	</div>

	<!-- スクロール可能なメインコンテンツ -->
	<main class="flex-1 overflow-auto">
		<div class="animate-fade-in">
			{@render children?.()}
		</div>
	</main>
</div>
