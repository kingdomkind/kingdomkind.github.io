<script lang="ts">
    let { text, visible }: { text: string; visible: boolean } = $props();
</script>

<div class="tooltip" class:visible role="tooltip">{text}</div>

<style>
    .tooltip {
        position: absolute;
        bottom: calc(100% + 0.5rem);
        left: 50%;
        transform: translateX(-50%) translateY(4px);
        background: var(--color-tooltip);
        border-radius: var(--border-radius);
        color: var(--color-text);
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
        border-radius: 1rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition:
            opacity 150ms ease,
            transform 150ms ease;
    }

    .tooltip.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
</style>
