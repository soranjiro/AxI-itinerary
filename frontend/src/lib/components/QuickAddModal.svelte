<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    X,
    Plus,
    Calendar,
    MapPin,
    Package,
    DollarSign,
  } from "lucide-svelte";

  export let isOpen: boolean = false;
  export let type: "timeline" | "packing" | "budget" = "timeline";

  type QuickAddSavePayload =
    | {
        title: string;
        start_datetime: string;
        location_name: string;
        description: string;
        end_datetime: string;
        location_address: string;
        budget_amount: string;
        memo: string;
      }
    | {
        item_name: string;
        category: string;
        quantity: number;
        memo: string;
        assignee: string;
      }
    | {
        category: string;
        item_name: string;
        planned_amount: string;
        actual_amount: string;
        payer: string;
        split_method: string;
        expense_date: string;
      };

  const dispatch = createEventDispatcher<{
    save: QuickAddSavePayload;
    close: void;
  }>();

  let formData: any = {};
  let isSubmitting: boolean = false;

  function resetForm() {
    switch (type) {
      case "timeline":
        formData = {
          title: "",
          start_datetime: "",
          location_name: "",
          description: "",
        };
        break;
      case "packing":
        formData = {
          item_name: "",
          category: "",
          quantity: 1,
          memo: "",
          assignee: "",
        };
        break;
      case "budget":
        formData = {
          category: "",
          item_name: "",
          planned_amount: "",
          actual_amount: "",
          payer: "",
          split_method: "equal",
          expense_date: "",
        };
        break;
    }
  }

  function close() {
    if (isSubmitting) return;
    // update local binding so parent with bind:isOpen gets updated
    isOpen = false;
    resetForm();
    dispatch("close");
  }

  async function submit() {
    let isValid = false;
    switch (type) {
      case "timeline":
        isValid = !!formData.title?.trim();
        break;
      case "packing":
        isValid = !!formData.item_name?.trim();
        break;
      case "budget":
        isValid = !!formData.category?.trim() && !!formData.item_name?.trim();
        break;
    }
    if (!isValid) return;

    isSubmitting = true;
    try {
      let submitData: QuickAddSavePayload;
      switch (type) {
        case "timeline":
          submitData = {
            title: formData.title.trim(),
            start_datetime:
              formData.start_datetime ||
              (() => {
                const now = new Date();
                now.setMinutes(0, 0, 0);
                return now.toISOString().slice(0, 16);
              })(),
            location_name: formData.location_name || "",
            description: formData.description || "",
            end_datetime: "",
            location_address: "",
            budget_amount: "",
            memo: "",
          };
          break;
        case "packing":
          submitData = {
            item_name: formData.item_name.trim(),
            category: formData.category || "",
            quantity: formData.quantity || 1,
            memo: formData.memo || "",
            assignee: formData.assignee || "",
          };
          break;
        case "budget":
          submitData = {
            category: formData.category.trim(),
            item_name: formData.item_name.trim(),
            planned_amount: formData.planned_amount || "",
            actual_amount: formData.actual_amount || "",
            payer: formData.payer || "",
            split_method: formData.split_method || "equal",
            expense_date: formData.expense_date || "",
          };
          break;
      }
      dispatch("save", submitData);
      // ensure modal actually closes when used with bind:isOpen
      isOpen = false;
      close();
    } catch (error) {
      console.error("Failed to save item:", error);
    } finally {
      isSubmitting = false;
    }
  }

  import { tick } from "svelte";

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      submit();
    }
  }

  $: if (isOpen) {
    resetForm();
    // tick を待ってからフォーカスを設定
    tick().then(() => {
      let focusId = "";
      switch (type) {
        case "timeline":
          focusId = "title";
          break;
        case "packing":
          focusId = "item_name";
          break;
        case "budget":
          focusId = "category";
          break;
      }
      const el = document.getElementById(focusId) as HTMLInputElement | null;
      el?.focus();
    });
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    on:click|self={close}
    role="dialog"
    aria-modal="true"
    tabindex="0"
    on:keydown={handleKeydown}
  >
    <div
      class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
    >
      <!-- ヘッダー -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
      >
        <h2
          class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          {#if type === "timeline"}
            <Plus class="w-5 h-5 text-indigo-600" />
            予定を追加
          {:else if type === "packing"}
            <Package class="w-5 h-5 text-green-600" />
            持ち物を追加
          {:else if type === "budget"}
            <DollarSign class="w-5 h-5 text-blue-600" />
            予算を追加
          {/if}
        </h2>
        <button
          on:click={close}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- フォーム -->
      <form on:submit|preventDefault={submit} class="p-6 space-y-4">
        {#if type === "timeline"}
          <!-- タイトル（必須） -->
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              予定名 <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              bind:value={formData.title}
              placeholder="例: 東京駅集合"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <!-- 日時 -->
          <div>
            <label
              for="datetime"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
            >
              <Calendar class="w-4 h-4" />
              日時
            </label>
            <input
              id="datetime"
              type="datetime-local"
              bind:value={formData.start_datetime}
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- 場所 -->
          <div>
            <label
              for="location"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
            >
              <MapPin class="w-4 h-4" />
              場所
            </label>
            <input
              id="location"
              type="text"
              bind:value={formData.location_name}
              placeholder="例: 東京駅丸の内口"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- メモ -->
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              メモ
            </label>
            <textarea
              id="description"
              bind:value={formData.description}
              placeholder="詳細情報があれば記入..."
              rows="2"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
        {:else if type === "packing"}
          <!-- アイテム名（必須） -->
          <div>
            <label
              for="item_name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              アイテム名 <span class="text-red-500">*</span>
            </label>
            <input
              id="item_name"
              type="text"
              bind:value={formData.item_name}
              placeholder="例: Tシャツ"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <!-- カテゴリ -->
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              カテゴリ
            </label>
            <input
              id="category"
              type="text"
              bind:value={formData.category}
              placeholder="例: 衣類"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- 数量 -->
          <div>
            <label
              for="quantity"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              数量
            </label>
            <input
              id="quantity"
              type="number"
              bind:value={formData.quantity}
              min="1"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <!-- メモ -->
          <div>
            <label
              for="memo"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              メモ
            </label>
            <textarea
              id="memo"
              bind:value={formData.memo}
              placeholder="詳細情報があれば記入..."
              rows="2"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
        {:else if type === "budget"}
          <!-- カテゴリ（必須） -->
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              カテゴリ <span class="text-red-500">*</span>
            </label>
            <input
              id="category"
              type="text"
              bind:value={formData.category}
              placeholder="例: 交通費"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <!-- 項目名（必須） -->
          <div>
            <label
              for="item_name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              項目名 <span class="text-red-500">*</span>
            </label>
            <input
              id="item_name"
              type="text"
              bind:value={formData.item_name}
              placeholder="例: 新幹線代"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <!-- 予算金額 -->
          <div>
            <label
              for="planned_amount"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              予算金額
            </label>
            <input
              id="planned_amount"
              type="number"
              bind:value={formData.planned_amount}
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        {/if}

        <!-- アクションボタン -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            on:click={close}
            disabled={isSubmitting}
            class="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={(type === "timeline" && !formData.title?.trim()) ||
              (type === "packing" && !formData.item_name?.trim()) ||
              (type === "budget" &&
                (!formData.category?.trim() || !formData.item_name?.trim())) ||
              isSubmitting}
            class="flex-1 px-4 py-3 rounded-lg bg-[var(--gradient-primary)] text-white font-medium hover:shadow-lg hover:shadow-[color:var(--primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {#if isSubmitting}
              <div
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              追加中...
            {:else}
              <Plus class="w-4 h-4" />
              追加
            {/if}
          </button>
        </div>
      </form>

      <!-- ショートカットヒント -->
      <div class="px-6 pb-4 text-xs text-gray-500 dark:text-gray-400">
        ヒント: Esc でキャンセル、Cmd/Ctrl + Enter で追加
      </div>
    </div>
  </div>
{/if}
