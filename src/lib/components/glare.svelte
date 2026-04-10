<script lang="ts">
    /*
      The way this works is by creating a div the same size of the parent
      and then doing the circle in css to follow the mouse position.

      However, tracking is lost if another child element of the parent takes focus.
      Therefore, we allow manual control of the exported functions, that you can
      optionally bind to the parent handlers instead.
    */

    let glare!: HTMLDivElement;

    let { selfControl = true }: { selfControl?: boolean } = $props();

    let rafId = -1;

    export function onMouseEnter() {
        glare.style.setProperty("--glare-opacity-ratio", "1");
    }

    export function onMouseMove(e: MouseEvent) {
        if (rafId !== -1) return;
        rafId = requestAnimationFrame(() => {
            let rect = glare.getBoundingClientRect();
            if (!rect) {
                rafId = -1;
                return;
            }
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            glare.style.setProperty("--gx", `${x * 100}%`);
            glare.style.setProperty("--gy", `${y * 100}%`);
            rafId = -1;
        });
    }

    export function onMouseLeave() {
        cancelAnimationFrame(rafId);
        rafId = -1;
        glare.style.setProperty("--glare-opacity-ratio", "0");
    }
</script>

<div
    class="glare"
    role="presentation"
    bind:this={glare}
    onmouseenter={selfControl ? onMouseEnter : undefined}
    onmousemove={selfControl ? onMouseMove : undefined}
    onmouseleave={selfControl ? onMouseLeave : undefined}
></div>

<style>
    /* Set them as properties, so we can use transition on them */
    @property --gx {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 50%;
    }

    @property --gy {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 50%;
    }

    .glare {
        position: absolute;
        inset: 0;
        z-index: -1; /* Render below stuff */
        border-radius: inherit;
        background: radial-gradient(
            circle at var(--gx, 50%) var(--gy, 50%),
            var(--color-surface-hover) 0%,
            transparent 80%
        );
        opacity: var(--glare-opacity-ratio, 0);
        transition:
            opacity 350ms ease,
            --gx 200ms ease-out,
            --gy 200ms ease-out;
    }
</style>
