<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { X, Mail, Lock, User } from "lucide-svelte";
	import { user } from "$lib/stores/user";

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let isLogin = true;
	let email = "";
	let password = "";
	let name = "";
	let isLoading = false;
	let error = "";

	const close = () => {
		isOpen = false;
		dispatch("close");
		resetForm();
	};

	const resetForm = () => {
		email = "";
		password = "";
		name = "";
		error = "";
		isLogin = true;
	};

	const toggleMode = () => {
		isLogin = !isLogin;
		error = "";
	};

	const submit = async () => {
		if (!email.trim() || !password.trim()) {
			error = "メールアドレスとパスワードを入力してください";
			return;
		}

		if (!isLogin && !name.trim()) {
			error = "お名前を入力してください";
			return;
		}

		isLoading = true;
		error = "";

		try {
			const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
			const body = isLogin ? { email, password } : { email, password, name };

			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "認証に失敗しました");
			}

			const data = await response.json();
			user.login(data.user);
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : "エラーが発生しました";
		} finally {
			isLoading = false;
		}
	};

	const logout = () => {
		user.logout();
		close();
	};
</script>

{#if isOpen}
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
	>
		<div
			class="card border-theme-glow w-full max-w-md max-h-[90vh] overflow-y-auto"
		>
			<!-- ヘッダー -->
			<div
				class="flex justify-between items-center p-8 border-b border-theme-glow"
			>
				<h3 class="text-2xl font-bold text-theme-gradient">
					{isLogin ? "ログイン" : "アカウント作成"}
				</h3>
				<button
					on:click={close}
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 transform hover:scale-110 hover-theme-lift"
				>
					<X class="w-6 h-6" />
				</button>
			</div>

			<!-- フォーム -->
			<div class="p-8 space-y-6">
				{#if !isLogin}
					<div class="space-y-2">
						<label
							for="name"
							class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
						>
							お名前
						</label>
						<div class="relative">
							<User
								class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
							/>
							<input
								id="name"
								type="text"
								bind:value={name}
								placeholder="山田太郎"
								class="input-field pl-10"
								required={!isLogin}
							/>
						</div>
					</div>
				{/if}

				<div class="space-y-2">
					<label
						for="email"
						class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
					>
						メールアドレス
					</label>
					<div class="relative">
						<Mail
							class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
						/>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="example@email.com"
							class="input-field pl-10"
							required
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label
						for="password"
						class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
					>
						パスワード
					</label>
					<div class="relative">
						<Lock
							class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
						/>
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="6文字以上"
							class="input-field pl-10"
							required
							minlength="6"
						/>
					</div>
				</div>

				{#if error}
					<div
						class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
					>
						<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
					</div>
				{/if}

				<button
					on:click={submit}
					disabled={isLoading ||
						!email.trim() ||
						!password.trim() ||
						(!isLogin && !name.trim())}
					class="btn-primary w-full flex items-center justify-center space-x-2"
				>
					{#if isLoading}
						<div
							class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
						></div>
						<span>{isLogin ? "ログイン中..." : "作成中..."}</span>
					{:else}
						<span>{isLogin ? "ログイン" : "アカウント作成"}</span>
					{/if}
				</button>

				<div class="text-center">
					<button
						on:click={toggleMode}
						class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
					>
						{isLogin
							? "アカウントをお持ちでない方はこちら"
							: "既にアカウントをお持ちの方"}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
