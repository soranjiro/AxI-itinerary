<script lang="ts">
  import { Edit3, Clock, MapPin, Trash2 } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import { user } from "$lib/stores/user";

  export let timelineItems: Array<any> = [];
  const dispatch = createEventDispatcher<{ edit: any; delete: any }>();

  let groupedItems: Record<string, { items: any[]; dayIndex: number }>;

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      time:
        date.getUTCHours().toString().padStart(2, "0") +
        ":" +
        date.getUTCMinutes().toString().padStart(2, "0"),
      date:
        date.getUTCFullYear() +
        "-" +
        String(date.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getUTCDate()).padStart(2, "0"),
    };
  };

  const getDayFromDateTime = (dateTime: string, index: number) => {
    return `${index + 1}日目`;
  };

  // 日付ごとにアイテムをグループ化し、時間順にソート
  $: groupedItems = timelineItems.reduce((groups, item, index) => {
    const date = new Date(item.start_datetime);
    const dateKey = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
    if (!groups[dateKey]) {
      groups[dateKey] = { items: [], dayIndex: Object.keys(groups).length };
    }
    groups[dateKey].items.push(item);
    return groups;
  }, {});

  // 各グループ内のアイテムを時間順にソート
  $: {
    Object.values(groupedItems).forEach((group) => {
      group.items.sort((a, b) => {
        const timeA = new Date(a.start_datetime).getTime();
        const timeB = new Date(b.start_datetime).getTime();
        return timeA - timeB;
      });
    });
  }
</script>

<div class="relative">
  {#each Object.entries(groupedItems) as [dateKey, group]}
    {@const dateObj = new Date(dateKey + "T00:00:00Z")}
    {@const formattedDate =
      dateObj.getUTCFullYear() +
      "-" +
      String(dateObj.getUTCMonth() + 1).padStart(2, "0") +
      "-" +
      String(dateObj.getUTCDate()).padStart(2, "0")}
    {@const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][
      dateObj.getUTCDay()
    ]}
    <!-- 日付ヘッダー -->
    <div
      class="bg-secondary border border-default rounded-lg p-4 mt-6 mb-6 flex items-center justify-between"
    >
      <div class="flex items-center space-x-3">
        <div class="text-lg font-bold text-primary">
          {formattedDate}
        </div>
        <div
          class="bg-primary text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
        >
          {dayOfWeek}
        </div>
      </div>
      <div
        class="bg-primary text-primary border border-default rounded-lg px-3 py-1"
      >
        <span class="text-sm font-medium text-secondary"
          >{getDayFromDateTime(dateKey, group.dayIndex)}</span
        >
      </div>
    </div>

    <!-- タイムライン -->
    <div class="space-y-4">
      {#each group.items as item, index}
        {@const datetime = formatDateTime(item.start_datetime)}
        <div class="relative flex items-start space-x-4">
          <!-- タイムライン線とアイコン -->
          <div class="flex flex-col items-center">
            <!-- ハート型アイコン -->
            <div class="w-6 h-6 text-primary mb-2">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-full h-full"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </div>

            <!-- 縦線（最後のアイテム以外） -->
            {#if index < group.items.length - 1}
              <div
                class="w-0.5 h-16 border-l-2 border-dashed border-default"
              ></div>
            {/if}
          </div>

          <!-- コンテンツカード -->
          <div class="flex-1 bg-secondary rounded-lg p-4 min-h-[80px]">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Clock class="w-4 h-4 text-secondary" />
                <span class="text-lg font-bold text-primary"
                  >{datetime.time}</span
                >
                <MapPin class="w-4 h-4 text-secondary ml-2" />
                <span class="text-sm text-secondary">{index + 1}</span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  class="p-2 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all duration-200"
                  on:click={() => dispatch("edit", item)}
                >
                  <Edit3 class="w-5 h-5" />
                </button>
                <button
                  class="p-2 text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  on:click={() => dispatch("delete", item)}
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>

            <h3 class="text-lg font-semibold text-primary mb-1">
              {item.title}
            </h3>

            {#if item.description}
              <p class="text-sm text-secondary mb-2">
                {item.description}
              </p>
            {/if}

            {#if item.location_name}
              <div class="flex items-center space-x-1 text-sm text-muted">
                <MapPin class="w-3 h-3" />
                <span>{item.location_name}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>
