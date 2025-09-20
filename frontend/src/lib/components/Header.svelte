<script lang="ts">
	import { goto } from "$app/navigation";
	import { BookOpen, User, LogOut } from "lucide-svelte";
	import { user } from "$lib/stores/user";
	import ThemeSelector from "./ThemeSelector.svelte";

	let showAuthModal = false;

	const goHome = () => {
		goto("/");
	};

	const openAuthModal = () => {
		showAuthModal = true;
	};

	const logout = () => {
		user.logout();
		goto("/");
	};
</script>

<header
	class="border-b border-border bg-bg-primary transition-all duration-300"
>
	<div class="container mx-auto px-6 py-4">
		<div class="flex items-center justify-between">
			<!-- ロゴ -->
			<button
				on:click={goHome}
				class="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-text-primary bg-transparent border-0 cursor-pointer hover:bg-primary-light hover:-translate-y-0.5"
				aria-label="ホームに戻る"
			>
				<BookOpen class="w-5 h-5" />
				<span
					class="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent"
					>AxI-itinerary</span
				>
			</button>

			<!-- 右側メニュー -->
			<div class="flex items-center gap-4">
				{#if $user}
					<button
						on:click={() => goto("/my-itineraries")}
						class="px-4 py-2 rounded-lg font-medium text-text-secondary bg-transparent border-0 cursor-pointer transition-all duration-200 hover:text-text-primary hover:bg-bg-tertiary"
					>
						<User class="w-4 h-4" />
						<span>{$user.name || $user.email}</span>
					</button>
					<!-- <div
					class="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary text-text-secondary text-sm"
					>
					マイしおり
				</div> -->
					<button
						on:click={logout}
						class="flex items-center justify-center w-10 h-10 rounded-lg border-0 cursor-pointer transition-all duration-200 bg-transparent text-text-secondary hover:bg-danger-light hover:text-danger"
						aria-label="ログアウト"
					>
						<LogOut class="w-4 h-4" />
					</button>
				{:else}
					<button
						on:click={openAuthModal}
						class="px-4 py-2 rounded-lg font-medium bg-gradient-primary text-white border-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary"
					>
						ログイン
					</button>
				{/if}

				<!-- テーマセレクター -->
				<ThemeSelector />
			</div>
		</div>
	</div>
</header>

{#if showAuthModal}
	{#await import("$lib/components/AuthModal.svelte") then AuthModal}
		<AuthModal.default bind:isOpen={showAuthModal} />
	{/await}
{/if}
