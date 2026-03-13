<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, onclick, href }: {
    children: Snippet;
    onclick: () => void;
    href: string | null;
  } = $props();
</script>

{#if href}
  <a class="btn glass hoverable" href={href} target="_blank" rel="noopener noreferrer" {onclick}>
    {@render children()}
  </a>
{:else}
  <button class="btn glass hoverable" {onclick}>
    {@render children()}
  </button>
{/if}

<style>
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    position: relative;
    color: inherit;
    font-family: inherit;
    text-decoration: none;
    font-size: 1rem;
    line-height: 1;
    box-sizing: border-box;
    cursor: pointer;
    transition:
      background-color var(--transition-color),
      border-color var(--transition-color);
  }
</style>
