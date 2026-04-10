<script lang="ts">
    import RotatingCard from "$lib/components/rotating-card.svelte";
    import Button from "$lib/components/button.svelte";
    import Tooltip from "$lib/components/tooltip.svelte";

    let {
        tooltip,
        clickedTooltip,
        onclick,
        class: className = "",
        children,
    }: {
        tooltip: string;
        clickedTooltip: string;
        onclick?: () => void;
        class?: string;
        children: any;
    } = $props();

    // svelte-ignore state_referenced_locally
    let currentTooltip = $state(tooltip);
    let hovered = $state(false);
</script>

<Button
    class={className}
    onhover={(h) => {
        hovered = h;
        // Reset tooltip on hover. We do this on hover gain
        // rather than hover lost so you cannot see the text change
        if (h == true) {
            currentTooltip = tooltip;
        }
    }}
    onclick={() => {
        currentTooltip = clickedTooltip;
        onclick?.();
    }}
>
    <Tooltip text={currentTooltip} visible={hovered} />
    {@render children()}
</Button>
