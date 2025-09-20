<script lang="ts">
  import { Edit3, Trash2 } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let packingItems: Array<any> = [];
  const dispatch = createEventDispatcher<{ edit: any; delete: any }>();
</script>

<div class="card overflow-hidden">
  {#each packingItems as item}
    <div
      class="flex items-center justify-between p-6 border-b border-border last:border-b-0 hover:bg-bg-tertiary transition-colors duration-200"
    >
      <div class="flex items-center space-x-4">
        <input
          type="checkbox"
          bind:checked={item.is_checked}
          class="w-6 h-6 text-success rounded-lg focus:ring-success border-2 border-border transition-colors"
        />
        <div
          class:line-through={item.is_checked}
          class="transition-all duration-200"
          class:text-text-muted={item.is_checked}
        >
          <span class="text-lg font-semibold text-text-primary"
            >{item.item_name}</span
          >
          {#if item.category}
            <span
              class="text-sm text-text-muted ml-3 bg-bg-tertiary px-3 py-1 rounded-full"
            >
              {item.category}
            </span>
          {/if}
          <span
            class="text-sm text-text-muted ml-3 bg-secondary-light text-secondary px-3 py-1 rounded-full"
          >
            × {item.quantity}
          </span>
        </div>
      </div>
      <button
        class="p-3 text-text-muted hover:text-success hover:bg-success-light rounded-xl transition-all duration-200 transform hover:scale-110"
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
