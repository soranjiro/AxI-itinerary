<script lang="ts">
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value = "";
  export let required = false;
  export let disabled = false;
  export let readonly = false;
  export let rows = 3;
  export let label: string | undefined = undefined;
  export let help: string | undefined = undefined;
  export let error: string | undefined = undefined;

  let textareaElement: HTMLTextAreaElement;

  export function focus() {
    textareaElement?.focus();
  }
</script>

<div class="form-group">
  {#if label}
    <label for={id} class="form-label">
      {label}
      {#if required}
        <span class="text-danger">*</span>
      {/if}
    </label>
  {/if}

  <textarea
    bind:this={textareaElement}
    bind:value
    {id}
    {name}
    {placeholder}
    {required}
    {disabled}
    {readonly}
    {rows}
    class="textarea-field"
    class:border-danger={error}
  ></textarea>

  {#if help && !error}
    <div class="form-help">{help}</div>
  {/if}

  {#if error}
    <div class="form-help text-danger">{error}</div>
  {/if}
</div>

<style>
  .text-danger {
    color: var(--danger);
  }

  .border-danger {
    border-color: var(--danger);
  }
</style>
