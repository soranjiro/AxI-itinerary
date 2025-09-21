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
        const now = new Date();
        formData = {
          title: "",
          date: now.toLocaleDateString("sv-SE"), // YYYY-MM-DD format in local timezone
          hour: now.getHours().toString().padStart(2, "0"),
          minute: (Math.floor(now.getMinutes() / 15) * 15).toString(),
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
          const startDatetime =
            formData.date && formData.hour && formData.minute !== undefined
              ? `${formData.date}T${formData.hour.padStart(2, "0")}:${formData.minute.padStart(2, "0")}:00`
              : (() => {
                  const now = new Date();
                  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);
                  // Use local timezone instead of UTC
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, "0");
                  const day = String(now.getDate()).padStart(2, "0");
                  const hours = String(now.getHours()).padStart(2, "0");
                  const minutes = String(now.getMinutes()).padStart(2, "0");
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })();
          submitData = {
            title: formData.title.trim(),
            start_datetime: startDatetime,
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
      class="w-full max-w-md bg-card-bg rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
    >
      <!-- ヘッダー -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-xl font-bold text-text-primary flex items-center gap-2">
          {#if type === "timeline"}
            <Plus class="w-5 h-5 text-accent" />
            予定を追加
          {:else if type === "packing"}
            <Package class="w-5 h-5 text-success" />
            持ち物を追加
          {:else if type === "budget"}
            <DollarSign class="w-5 h-5 text-accent" />
            予算を追加
          {/if}
        </h2>
        <button
          on:click={close}
          class="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          disabled={isSubmitting}
        >
          <X class="w-5 h-5 text-text-muted" />
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <!-- 日時 -->
          <div>
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1"
            >
              <Calendar class="w-4 h-4" />
              日時
            </label>
            <div class="flex space-x-2">
              <input
                type="date"
                bind:value={formData.date}
                class="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                bind:value={formData.hour}
                class="w-20 px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {#each Array(24) as _, i}
                  <option value={i.toString().padStart(2, "0")}
                    >{i.toString().padStart(2, "0")}</option
                  >
                {/each}
              </select>
              <span class="flex items-center text-gray-500">:</span>
              <select
                bind:value={formData.minute}
                class="w-20 px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="0">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-dark-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        {/if}

        <!-- アクションボタン -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            on:click={close}
            disabled={isSubmitting}
            class="flex-1 px-4 py-3 rounded-lg border border-border text-text-secondary hover:bg-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            class="flex-1 px-4 py-3 rounded-lg bg-gradient-primary text-primary-text font-medium hover:shadow-lg hover:shadow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {#if isSubmitting}
              <div
                class="w-4 h-4 border-2 border-primary-text border-t-transparent rounded-full animate-spin"
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
      <div class="px-6 pb-4 text-xs text-text-muted">
        ヒント: Esc でキャンセル、Cmd/Ctrl + Enter で追加
      </div>
    </div>
  </div>
{/if}
