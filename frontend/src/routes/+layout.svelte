<script lang="ts">
	import "../app.css";
	import Header from "$lib/components/Header.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<title>AxI-itinerary - AI旅行しおり作成ツール</title>
	<meta name="description" content="AIを活用した協調的な旅行しおり作成ツール" />
	<link rel="icon" href="/favicon.ico" />
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
	class="min-h-screen transition-all duration-300 bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]"
>
	<Header />
	<main class="flex-1 animate-fade-in">
		{@render children?.()}
	</main>
</div>
