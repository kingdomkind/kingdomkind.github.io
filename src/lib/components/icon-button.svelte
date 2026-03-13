<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        onclick,
        spinning,
        ariaLabel,
        children,
    }: {
        onclick: () => void;
        spinning: boolean;
        ariaLabel: string;
        children: Snippet;
    } = $props();
</script>

<button class="btn" class:spin={spinning} {onclick} aria-label={ariaLabel}>
    {@render children()}
</button>

<style>
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--color-text);
        cursor: pointer;
        padding: 0.25rem;
        opacity: 0.8;
        transition: opacity var(--transition-color);
    }
    .btn:hover { opacity: 1; }
</style>
