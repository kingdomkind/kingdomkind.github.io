<script lang="ts">
    import type { Snippet } from "svelte";
    import Glare from "$lib/components/glare.svelte";

    const TILT_DEGREES = 15;

    let { children }: { children: Snippet } = $props();

    let card: HTMLDivElement;
    let rect: DOMRect | null = null;
    let ticking = false;

    function onMouseMove(e: MouseEvent) {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            rect ??= card.getBoundingClientRect();
            if (!rect) {
                ticking = false;
                return;
            }
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.setProperty("--rx", `${(y - 0.5) * -TILT_DEGREES}deg`);
            card.style.setProperty("--ry", `${(x - 0.5) *  TILT_DEGREES}deg`);
            ticking = false;
        });
    }

    function onMouseLeave() {
        rect = null;
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
    }
</script>

<div
    class="card glass glass-blur"
    bind:this={card}
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
    role="presentation"
>
    <Glare />
    <div class="card-content">
        {@render children()}
    </div>
</div>

<style>
    .card {
        --rx: 0deg;
        --ry: 0deg;
        position: relative;
        padding: 2rem;
        overflow: hidden;
        border-radius: 16px;
        will-change: transform;
        transform: perspective(600px) rotateX(var(--rx)) rotateY(var(--ry));
        transition:
            transform var(--transition-transform),
            background-color var(--transition-color),
            border-color var(--transition-color);
    }

    .card-content {
        position: relative;
        z-index: 2;
    }
</style>
