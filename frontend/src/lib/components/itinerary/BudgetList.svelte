<script lang="ts">
  import { Edit3, Trash2 } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let budgetItems: Array<any> = [];
  const dispatch = createEventDispatcher<{ edit: any; delete: any }>();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
</script>

<div class="card overflow-hidden">
  {#each budgetItems as item}
    <div
      class="flex items-center justify-between p-6 border-b border-theme-glow last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
    >
      <div class="flex-1">
        <div class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {item.item_name}
        </div>
        <div
          class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block"
        >
          {item.category}
        </div>
      </div>
      <div class="text-right mr-4">
        <div class="text-lg font-bold text-gray-900 dark:text-white mb-1">
          予算: {item.planned_amount
            ? formatCurrency(item.planned_amount)
            : "未設定"}
        </div>
        {#if item.actual_amount}
          <div
            class="text-sm font-medium {item.actual_amount >
            (item.planned_amount || 0)
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'}"
          >
            実費: {formatCurrency(item.actual_amount)}
            {#if item.planned_amount}
              <span class="ml-2">
                ({item.actual_amount > item.planned_amount ? "+" : ""}{(
                  item.actual_amount - item.planned_amount
                ).toLocaleString()}円)
              </span>
            {/if}
          </div>
        {:else}
          <div class="text-sm text-gray-500 dark:text-gray-400">
            実費: 未入力
          </div>
        {/if}
      </div>
      <button
        class="p-3 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 transform hover:scale-110 hover-theme-lift"
        on:click={() => dispatch("edit", item)}
      >
        <Edit3 class="w-6 h-6" />
      </button>
      <button
        class="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 transform hover:scale-110 hover-theme-lift"
        on:click={() => dispatch("delete", item)}
      >
        <Trash2 class="w-6 h-6" />
      </button>
    </div>
  {/each}
</div>
