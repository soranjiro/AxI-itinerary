<script lang="ts">
  import {
    itineraryTheme,
    itineraryThemes,
    type ItineraryTheme,
  } from "$lib/stores/itineraryTheme";

  let isOpen = false;

  function selectTheme(theme: ItineraryTheme) {
    itineraryTheme.set(theme);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  // 外側クリックで閉じる
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest(".theme-selector-container")) {
      isOpen = false;
    }
  }

  // 現在のテーマ情報（未定義時は travel にフォールバック）
  $: currentThemeInfo =
    itineraryThemes[$itineraryTheme] ?? itineraryThemes.travel;
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative theme-selector-container">
  <!-- メインボタン - テーマに応じたグラデーション -->
  <button
    class="group relative overflow-hidden px-6 py-4 rounded-2xl transition-all duration-300
           shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
           bg-gradient-to-r {currentThemeInfo.gradient} text-primary-text
           border-2 border-white/20 hover:border-white/40
           backdrop-blur-sm"
    on:click={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <!-- 背景アニメーション -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                transition-transform duration-700"
    ></div>

    <div class="relative flex items-center gap-3">
      <!-- アイコン -->
      <div
        class="text-2xl transform group-hover:scale-110 transition-transform duration-200"
      >
        {currentThemeInfo.icon}
      </div>

      <!-- テキスト -->
      <div class="flex flex-col items-start">
        <span class="text-sm font-medium opacity-90">テーマ</span>
        <span class="font-bold text-lg leading-none"
          >{currentThemeInfo.name}</span
        >
      </div>

      <!-- 矢印 -->
      <svg
        class="w-5 h-5 ml-2 transition-transform duration-300 {isOpen
          ? 'rotate-180'
          : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </button>

  <!-- ドロップダウンメニュー -->
  {#if isOpen}
    <div
      class="absolute right-0 mt-4 w-80 bg-card-bg/95 border border-card-border
             rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl
             animate-in slide-in-from-top-2 fade-in duration-200"
    >
      <div class="p-6">
        <h3 class="text-lg font-bold text-text-primary mb-4 text-center">
          テーマを選択
        </h3>

        <!-- テーマグリッド -->
        <div class="grid grid-cols-2 gap-3">
          {#each Object.entries(itineraryThemes) as [themeKey, themeInfo]}
            <button
              class="group relative overflow-hidden p-4 rounded-2xl transition-all duration-300
                     hover:scale-105 active:scale-95 transform
                     {$itineraryTheme === themeKey
                ? `bg-gradient-to-r ${themeInfo.gradient} text-primary-text shadow-lg scale-105`
                : 'bg-bg-secondary hover:bg-bg-tertiary text-text-primary border border-border hover:border-border-hover'}"
              on:click={() => selectTheme(themeKey as ItineraryTheme)}
              role="option"
              aria-selected={$itineraryTheme === themeKey}
            >
              <!-- 選択中の場合のグロー効果 -->
              {#if $itineraryTheme === themeKey}
                <div
                  class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                            transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                            transition-transform duration-1000"
                ></div>
              {/if}

              <div class="relative flex flex-col items-center space-y-2">
                <!-- アイコン -->
                <div
                  class="text-3xl transform group-hover:scale-110 transition-transform duration-200"
                >
                  {themeInfo.icon}
                </div>

                <!-- テーマ名 -->
                <div class="text-center">
                  <div class="font-bold text-sm">{themeInfo.name}</div>
                  <div class="text-xs opacity-75 mt-1">
                    {themeInfo.description}
                  </div>
                </div>

                <!-- 選択済みアイコン -->
                {#if $itineraryTheme === themeKey}
                  <div
                    class="absolute -top-1 -right-1 w-6 h-6 bg-white/20 rounded-full
                              flex items-center justify-center backdrop-blur-sm"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                {/if}
              </div>
            </button>
          {/each}
        </div>

        <!-- フッター -->
        <div class="mt-4 pt-4 border-t border-border text-center">
          <p class="text-xs text-text-muted">
            テーマは旅行の雰囲気に合わせて選択できます
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
