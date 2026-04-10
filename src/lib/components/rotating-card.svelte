<script lang="ts">
    import Glare from "./glare.svelte";

    const TILT_DEGREES = 15;
    let { children } = $props();
    let card!: HTMLDivElement;
    let glare: Glare;

    let rafId = -1;

    function onMouseEnter(e: MouseEvent) {
        glare?.onMouseEnter();
    }

    function onMouseMove(e: MouseEvent) {
        if (rafId !== -1) return;
        rafId = requestAnimationFrame(() => {
            let rect = card.getBoundingClientRect();
            if (!rect) {
                rafId = -1;
                return;
            }
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.setProperty("--rx", `${(y - 0.5) * -TILT_DEGREES}deg`);
            card.style.setProperty("--ry", `${(x - 0.5) * TILT_DEGREES}deg`);
            rafId = -1;
        });
        glare?.onMouseMove(e);
    }

    function onMouseLeave() {
        cancelAnimationFrame(rafId);
        rafId = -1;
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        glare?.onMouseLeave();
    }
</script>

<div
    class="card glass"
    role="region"
    bind:this={card}
    onmouseenter={onMouseEnter}
    onmousemove={onMouseMove}
    onmouseleave={onMouseLeave}
>
    <Glare bind:this={glare} selfControl={false} />
    {@render children()}
</div>

<style>
    .card {
        transform: perspective(600px) rotateX(var(--rx, 0deg))
            rotateY(var(--ry, 0deg));
        will-change: transform;

        padding: 2rem;
        transition:
            transform var(--transition-transform),
            background-color var(--transition-color),
            border-color var(--transition-color);
    }
</style>
