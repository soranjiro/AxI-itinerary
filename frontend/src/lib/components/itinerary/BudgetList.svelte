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
      class="flex items-center justify-between p-6 border-b border-border last:border-b-0 hover:bg-bg-tertiary transition-colors duration-200"
    >
      <div class="flex-1">
        <div class="text-lg font-semibold text-text-primary mb-1">
          {item.item_name}
        </div>
        <div
          class="text-sm text-text-muted bg-bg-tertiary px-3 py-1 rounded-full inline-block"
        >
          {item.category}
        </div>
      </div>
      <div class="text-right mr-4">
        <div class="text-lg font-bold text-text-primary mb-1">
          予算: {item.planned_amount
            ? formatCurrency(item.planned_amount)
            : "未設定"}
        </div>
        {#if item.actual_amount}
          <div
            class="text-sm font-medium {item.actual_amount >
            (item.planned_amount || 0)
              ? 'text-danger'
              : 'text-success'}"
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
          <div class="text-sm text-text-muted">実費: 未入力</div>
        {/if}
      </div>
      <button
        class="p-3 text-text-muted hover:text-accent hover:bg-primary-light rounded-xl transition-all duration-200 transform hover:scale-110"
        on:click={() => dispatch("edit", item)}
      >
        <Edit3 class="w-6 h-6" />
      </button>
      <button
        class="p-3 text-text-muted hover:text-danger hover:bg-danger-light rounded-xl transition-all duration-200 transform hover:scale-110"
        on:click={() => dispatch("delete", item)}
      >
        <Trash2 class="w-6 h-6" />
      </button>
    </div>
  {/each}
</div>
