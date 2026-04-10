<script lang="ts">
    let {
        onclick,
        onhover,
        class: className = "",
        children,
    }: {
        onclick?: () => void;
        onhover?: (hovered: boolean) => void;
        class?: string;
        children: any;
    } = $props();
</script>

<button
    class="button glass glass-hover {className}"
    onmouseenter={() => onhover?.(true)}
    onmouseleave={() => onhover?.(false)}
    onclick={() => onclick?.()}
>
    {@render children()}
</button>

<style>
    .button {
        position: relative;
        padding: 0.5rem;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
        border-radius: calc(var(--border-radius) / 2);
    }

    .button:hover {
        border-radius: calc(var(--border-radius-hover) / 2);
    }
</style>
