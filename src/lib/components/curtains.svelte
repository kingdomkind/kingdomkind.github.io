<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        started,
        hidden,
        onStart,
        children,
    }: {
        started: boolean;
        hidden: boolean;
        onStart: () => void;
        children: Snippet;
    } = $props();
</script>

{#if !hidden}
    <div class="curtains" class:open={started}>
        <div class="curtain left"></div>
        <div class="curtain right"></div>
        <button
            class="play-btn glass glass-blur"
            class:dissolve={started}
            onclick={onStart}
        >
            {@render children()}
        </button>
    </div>
{/if}

<style>
    .curtains {
        position: fixed;
        inset: 0;
        z-index: 200;
        display: grid;
        place-items: center;
    }

    .curtain {
        position: absolute;
        top: 0; bottom: 0;
        width: 55%;
        background: black;
        transition: transform 800ms cubic-bezier(0.76, 0, 0.24, 1);
    }
    .curtain.left  { left: 0;  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%); }
    .curtain.right { right: 0; clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%); }
    .curtains.open .curtain.left  { transform: translateX(-100%); }
    .curtains.open .curtain.right { transform: translateX(100%);  }

    .play-btn {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        border-radius: 30%;
        color: var(--color-text);
        cursor: pointer;
        transition: border-radius var(--transition-transform);
    }
    .play-btn:hover { border-radius: 50%; }

    .dissolve { animation: dissolve 500ms ease forwards; }
    @keyframes dissolve {
        0%   { transform: rotate(0deg)   scale(1);   opacity: 1;   }
        50%  { transform: rotate(180deg) scale(1.2); opacity: 0.5; }
        100% { transform: rotate(360deg) scale(0);   opacity: 0;   }
    }
</style>
