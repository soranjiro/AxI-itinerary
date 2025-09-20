<script lang="ts">
  export let variant: "primary" | "secondary" | "ghost" = "primary";
  export let size: "sm" | "md" | "lg" = "md";
  export let disabled = false;
  export let fullWidth = false;
  export let type: "button" | "submit" | "reset" = "button";
  export let href: string | undefined = undefined;

  $: classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    fullWidth ? "btn-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
</script>

{#if href}
  <a {href} class={classes} data-disabled={disabled}>
    <slot />
  </a>
{:else}
  <button {type} {disabled} class={classes}>
    <slot />
  </button>
{/if}

<style>
  [data-disabled="true"] {
    pointer-events: none;
    opacity: 0.5;
  }
</style>
