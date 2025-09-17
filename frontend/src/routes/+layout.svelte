<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>AxI-itinerary - AI旅行しおり作成ツール</title>
	<meta name="description" content="AIを活用した協調的な旅行しおり作成ツール" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

{@render children?.()}
