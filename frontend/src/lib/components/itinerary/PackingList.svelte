<script lang="ts">
  import { Edit3, Trash2 } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let packingItems: Array<any> = [];
  const dispatch = createEventDispatcher<{ edit: any; delete: any }>();
</script>

<div class="card overflow-hidden">
  {#each packingItems as item}
    <div
      class="flex items-center justify-between p-6 border-b border-theme-glow last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
    >
      <div class="flex items-center space-x-4">
        <input
          type="checkbox"
          bind:checked={item.is_checked}
          class="w-6 h-6 text-green-600 dark:text-green-400 rounded-lg focus:ring-green-500 dark:focus:ring-green-400 border-2 border-gray-300 dark:border-gray-600 transition-colors"
        />
        <div
          class:line-through={item.is_checked}
          class="transition-all duration-200"
          class:text-gray-500={item.is_checked}
          class:text-gray-400={item.is_checked}
        >
          <span class="text-lg font-semibold text-gray-900 dark:text-white"
            >{item.item_name}</span
          >
          {#if item.category}
            <span
              class="text-sm text-gray-500 dark:text-gray-400 ml-3 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
            >
              {item.category}
            </span>
          {/if}
          <span
            class="text-sm text-gray-500 dark:text-gray-400 ml-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full"
          >
            × {item.quantity}
          </span>
        </div>
      </div>
      <button
        class="p-3 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 transform hover:scale-110 hover-theme-lift"
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
