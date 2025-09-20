<script lang="ts">
  import { theme, type Theme } from "$lib/stores/theme";
  import { onMount } from "svelte";

  const themes: {
    value: Theme;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      value: "auto",
      label: "オート",
      icon: "🌓",
      color: "linear-gradient(45deg, #6366f1, #8b5cf6)",
    },
    {
      value: "light",
      label: "ライト",
      icon: "☀️",
      color: "#ffffff",
    },
    {
      value: "dark",
      label: "ダーク",
      icon: "🌙",
      color: "#1f2937",
    },
    {
      value: "seaside",
      label: "シーサイド",
      icon: "🏖️",
      color: "#0891b2",
    },
    {
      value: "itinerary-travel",
      label: "トラベル",
      icon: "✈️",
      color: "#dc2626",
    },
    {
      value: "itinerary-business",
      label: "ビジネス",
      icon: "💼",
      color: "#374151",
    },
    {
      value: "itinerary-minimalist",
      label: "ミニマル",
      icon: "⚪",
      color: "#6b7280",
    },
    {
      value: "itinerary-nature",
      label: "ネイチャー",
      icon: "🌲",
      color: "#059669",
    },
    {
      value: "itinerary-sakura",
      label: "さくら",
      icon: "🌸",
      color: "#ec4899",
    },
    {
      value: "itinerary-ocean",
      label: "オーシャン",
      icon: "🌊",
      color: "#0284c7",
    },
    {
      value: "itinerary-mountain",
      label: "マウンテン",
      icon: "⛰️",
      color: "#7c3aed",
    },
    {
      value: "itinerary-city",
      label: "シティ",
      icon: "🏙️",
      color: "#facc15",
    },
  ];

  let currentTheme: Theme;
  let isOpen = false;

  const unsubscribe = theme.subscribe((t) => {
    currentTheme = t;
  });

  function selectTheme(selectedTheme: Theme) {
    theme.set(selectedTheme);
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }
</script>

<div class="relative">
  <button
    class="btn-cta btn-sm flex items-center gap-2"
    on:click={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <span class="text-lg">
      {themes.find((t) => t.value === currentTheme)?.icon}
    </span>
    <span class="hidden sm:inline">
      {themes.find((t) => t.value === currentTheme)?.label}
    </span>
    <svg
      class={"w-4 h-4 transition-transform " + (isOpen ? "rotate-180" : "")}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      ></path>
    </svg>
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-56 card z-[200] animate-slide-up shadow-2xl overflow-hidden"
    >
      <div class="py-2">
        {#each themes as theme}
          <button
            class={"w-full text-left px-4 py-3 hover:bg-white/10 transition-all duration-200 flex items-center gap-3 " +
              (currentTheme === theme.value
                ? "bg-white/10 text-gradient border-l-4 border-l-current"
                : "")}
            on:click={() => selectTheme(theme.value)}
            role="option"
            aria-selected={currentTheme === theme.value}
          >
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-lg bg-primary transition-transform"
            >
              {theme.icon}
            </div>
            <span class="font-medium">{theme.label}</span>
            {#if currentTheme === theme.value}
              <svg
                class="w-4 h-4 ml-auto text-current"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .card {
    backdrop-filter: blur(10px);
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
  }
</style>
