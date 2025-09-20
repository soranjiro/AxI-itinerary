<script lang="ts">
  import { createEventDispatcher, tick, onMount } from "svelte";
  import { X, Sparkles } from "lucide-svelte";

  export let isOpen = false;
  export let type: "timeline" | "packing" | "budget" = "timeline";

  const dispatch = createEventDispatcher<{ save: any; close: void }>();
  let overlayEl: HTMLDivElement;
  let formData: any = {};
  let isSubmitting = false;

  $: if (isOpen) resetForm();

  function resetForm() {
    switch (type) {
      case "timeline":
        formData = {
          title: "",
          description: "",
          location_name: "",
          location_address: "",
          start_datetime: (() => {
            const now = new Date();
            now.setMinutes(0, 0, 0);
            return now.toISOString().slice(0, 16);
          })(),
          end_datetime: "",
          budget_amount: "",
          memo: "",
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

  function closeModal() {
    isOpen = false;
    dispatch("close");
  }

  function onOverlayClick(e: MouseEvent) {
    if (e.target === overlayEl) closeModal();
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    isSubmitting = true;
    try {
      await tick();
      dispatch("save", formData);
      closeModal();
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
</script>

{#if isOpen}
  <div
    bind:this={overlayEl}
    class="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    on:click={onOverlayClick}
    on:keydown={(e) => {
      if (e.key === "Escape") closeModal();
    }}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="card border-border max-w-md w-full max-h-[90vh] overflow-hidden"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2
          id="modal-title"
          class="text-xl font-bold text-text-primary flex items-center gap-2"
        >
          <Sparkles class="h-5 w-5 text-accent" />
          {type === "timeline"
            ? "タイムライン項目"
            : type === "packing"
              ? "持ち物項目"
              : "予算項目"}を追加
        </h2>
        <button
          on:click={closeModal}
          class="group relative overflow-hidden p-3 rounded-2xl hover:bg-bg-tertiary
                 transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
          aria-label="閉じる"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                      transition-transform duration-700"
          ></div>
          <X
            class="relative h-6 w-6 text-text-muted group-hover:text-text-primary transition-colors duration-200"
          />
        </button>
      </div>

      <form
        on:submit|preventDefault={handleSubmit}
        class="p-6 space-y-4 max-h-96 overflow-y-auto"
      >
        {#if type === "timeline"}
          <div class="space-y-4">
            <div>
              <label
                for="title"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >タイトル *</label
              >
              <input
                id="title"
                bind:value={formData.title}
                type="text"
                required
                class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                       focus:ring-accent/20 transition-all duration-300 text-text-primary
                       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                placeholder="例: 東京駅到着"
              />
            </div>
            <div>
              <label
                for="location_name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >場所</label
              >
              <input
                id="location_name"
                bind:value={formData.location_name}
                type="text"
                class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                       focus:ring-accent/20 transition-all duration-300 text-text-primary
                       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                placeholder="例: 東京駅"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="start_datetime"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >開始時刻</label
                >
                <input
                  id="start_datetime"
                  bind:value={formData.start_datetime}
                  type="datetime-local"
                  class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                         border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                         focus:ring-accent/20 transition-all duration-300 text-text-primary
                         backdrop-blur-sm shadow-inner hover:shadow-lg
                         focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                />
              </div>
              <div>
                <label
                  for="end_datetime"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >終了時刻</label
                >
                <input
                  id="end_datetime"
                  bind:value={formData.end_datetime}
                  type="datetime-local"
                  class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                         border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                         focus:ring-accent/20 transition-all duration-300 text-text-primary
                         backdrop-blur-sm shadow-inner hover:shadow-lg
                         focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                />
              </div>
            </div>
          </div>
        {:else if type === "packing"}
          <div class="space-y-4">
            <div>
              <label
                for="item_name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >アイテム名 *</label
              >
              <input
                id="item_name"
                bind:value={formData.item_name}
                type="text"
                required
                class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                       focus:ring-accent/20 transition-all duration-300 text-text-primary
                       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                placeholder="例: Tシャツ"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >カテゴリ</label
                >
                <input
                  id="category"
                  bind:value={formData.category}
                  type="text"
                  class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                         border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                         focus:ring-accent/20 transition-all duration-300 text-text-primary
                         backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                         focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                  placeholder="例: 衣類"
                />
              </div>
              <div>
                <label
                  for="quantity"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >数量</label
                >
                <input
                  id="quantity"
                  bind:value={formData.quantity}
                  type="number"
                  min="1"
                  class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                         border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                         focus:ring-accent/20 transition-all duration-300 text-text-primary
                         backdrop-blur-sm shadow-inner hover:shadow-lg
                         focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                />
              </div>
            </div>
          </div>
        {:else if type === "budget"}
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >カテゴリ *</label
                >
                <input
                  id="category"
                  bind:value={formData.category}
                  type="text"
                  required
                  class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                         border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                         focus:ring-accent/20 transition-all duration-300 text-text-primary
                         backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                         focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                  placeholder="例: 交通費"
                />
              </div>
              <div>
                <label
                  for="item_name"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >項目名 *</label
                >
                <input
                  id="item_name"
                  bind:value={formData.item_name}
                  type="text"
                  required
                  class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                         border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                         focus:ring-accent/20 transition-all duration-300 text-text-primary
                         backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                         focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                  placeholder="例: 新幹線代"
                />
              </div>
            </div>
            <div>
              <label
                for="planned_amount"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >予算金額</label
              >
              <input
                id="planned_amount"
                bind:value={formData.planned_amount}
                type="number"
                min="0"
                class="w-full px-6 py-4 bg-gradient-to-r from-bg-secondary/50 to-bg-tertiary/30
                       border border-border/50 rounded-2xl focus:border-accent/50 focus:ring-4
                       focus:ring-accent/20 transition-all duration-300 text-text-primary
                       backdrop-blur-sm shadow-inner hover:shadow-lg placeholder:text-text-muted/70
                       focus:bg-gradient-to-r focus:from-bg-secondary focus:to-bg-tertiary"
                placeholder="0"
              />
            </div>
          </div>
        {/if}
      </form>

      <div class="flex justify-end gap-4 p-6 border-t border-border">
        <button
          type="button"
          on:click={closeModal}
          class="group relative overflow-hidden px-8 py-4 text-text-secondary border border-border
                 rounded-2xl hover:bg-bg-tertiary hover:border-border-hover transition-all duration-300
                 font-semibold backdrop-blur-sm hover:text-text-primary shadow-lg hover:shadow-xl"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                      transition-transform duration-700"
          ></div>
          <span class="relative">キャンセル</span>
        </button>
        <button
          type="submit"
          on:click={handleSubmit}
          disabled={isSubmitting}
          class="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-accent to-accent-secondary
                 hover:from-accent-hover hover:to-accent text-accent-text rounded-2xl transition-all duration-300
                 shadow-lg hover:shadow-xl font-semibold flex items-center space-x-3 transform hover:scale-105
                 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full
                      transition-transform duration-700"
          ></div>
          {#if isSubmitting}
            <div
              class="relative animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
            ></div>
          {:else}
            <Sparkles class="relative h-5 w-5" />
          {/if}
          <span class="relative">{isSubmitting ? "追加中..." : "追加"}</span>
        </button>
      </div>
    </div>
  </div>
{/if}
