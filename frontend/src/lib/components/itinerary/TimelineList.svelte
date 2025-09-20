<script lang="ts">
  import { Edit3, Clock, MapPin } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let timelineItems: Array<any> = [];
  const dispatch = createEventDispatcher<{ edit: any }>();

  let groupedItems: Record<string, { items: any[]; dayIndex: number }>;

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      time: date.toLocaleString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: date.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
      }),
    };
  };

  const getDayFromDateTime = (dateTime: string, index: number) => {
    return `${index + 1}日目`;
  };

  // 日付ごとにアイテムをグループ化
  $: groupedItems = timelineItems.reduce((groups, item, index) => {
    const date = new Date(item.start_datetime).toDateString();
    if (!groups[date]) {
      groups[date] = { items: [], dayIndex: Object.keys(groups).length };
    }
    groups[date].items.push(item);
    return groups;
  }, {});
</script>

<div class="relative">
  {#each Object.entries(groupedItems) as [dateKey, group]}
    {@const dateObj = new Date(dateKey)}
    {@const formattedDate = dateObj.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    })}
    {@const dayOfWeek = dateObj.toLocaleDateString("ja-JP", {
      weekday: "short",
    })}
    <!-- 日付ヘッダー -->
    <div
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between"
    >
      <div class="flex items-center space-x-3">
        <div class="text-lg font-bold text-gray-800">{formattedDate}</div>
        <div
          class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
        >
          {dayOfWeek}
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg px-3 py-1">
        <span class="text-sm font-medium text-gray-700"
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
            <div class="w-6 h-6 text-red-500 mb-2">
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
                class="w-0.5 h-16 border-l-2 border-dashed border-red-300"
              ></div>
            {/if}
          </div>

          <!-- コンテンツカード -->
          <div class="flex-1 bg-gray-100 rounded-lg p-4 min-h-[80px]">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Clock class="w-4 h-4 text-gray-600" />
                <span class="text-lg font-bold text-gray-800"
                  >{datetime.time}</span
                >
                <MapPin class="w-4 h-4 text-gray-600 ml-2" />
                <span class="text-sm text-gray-600">{index + 1}</span>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                on:click={() => dispatch("edit", item)}
              >
                <Edit3 class="w-5 h-5" />
              </button>
            </div>

            <h3 class="text-lg font-semibold text-gray-900 mb-1">
              {item.title}
            </h3>

            {#if item.description}
              <p class="text-sm text-gray-600 mb-2">
                {item.description}
              </p>
            {/if}

            {#if item.location_name}
              <div class="flex items-center space-x-1 text-sm text-gray-500">
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
