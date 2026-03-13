<script lang="ts">
    import { onMount } from "svelte";

    const GLARE_LERP = 0.08;

    let glareX = $state(50);
    let glareY = $state(50);
    let targetX = $state(50);
    let targetY = $state(50);
    let active = $state(false);

    let root: HTMLDivElement | null = null;
    let host: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let ticking = false;
    let rafId = 0;

    function lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }

    function onMove(e: MouseEvent) {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            if (!rect && host) rect = host.getBoundingClientRect();
            if (rect) {
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                targetX = x * 100;
                targetY = y * 100;
            }
            ticking = false;
        });
    }

    function onEnter() {
        if (!host) return;
        rect = host.getBoundingClientRect();
        active = true;
    }

    function onLeave() {
        active = false;
    }

    function animate() {
        const dx = Math.abs(glareX - targetX);
        const dy = Math.abs(glareY - targetY);
        if (dx > 0.1 || dy > 0.1) {
            glareX = lerp(glareX, targetX, GLARE_LERP);
            glareY = lerp(glareY, targetY, GLARE_LERP);
            rafId = requestAnimationFrame(animate);
        }
    }

    onMount(() => {
        if (root) host = root.parentElement;
        if (!host) return;

        const onHostMove = (e: MouseEvent) => onMove(e);
        const onHostEnter = () => onEnter();
        const onHostLeave = () => onLeave();

        host.addEventListener("mousemove", onHostMove);
        host.addEventListener("mouseenter", onHostEnter);
        host.addEventListener("mouseleave", onHostLeave);

        return () => {
            host?.removeEventListener("mousemove", onHostMove);
            host?.removeEventListener("mouseenter", onHostEnter);
            host?.removeEventListener("mouseleave", onHostLeave);
        };
    });

    $effect(() => {
        targetX;
        targetY;
        active;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    });
</script>

<div
    class="glare-layer"
    bind:this={root}
    style="--gx: {glareX}%; --gy: {glareY}%; --glare-opacity-ratio: {active ? 1 : 0};"
    aria-hidden="true"
></div>

<style>
    .glare-layer {
        --gx: 50%;
        --gy: 50%;
        --glare-opacity-ratio: 0;
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        pointer-events: none;
        background: radial-gradient(
            circle at var(--gx) var(--gy),
            var(--color-surface-hover) 0%,
            transparent 80%
        );
        opacity: var(--glare-opacity-ratio);
        transition: opacity 350ms ease;
    }
</style>
