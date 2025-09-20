<script lang="ts">
	import AddItemModalBasic from "./AddItemModalBasic.svelte";

	export let isOpen = false;
	export let type: "timeline" | "packing" | "budget" = "timeline";
</script>

<!-- 互換レイヤー: 既存の参照を温存しつつ、Basic に完全委譲 -->
<AddItemModalBasic bind:isOpen {type} on:save />
