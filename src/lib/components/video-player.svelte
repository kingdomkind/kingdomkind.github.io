<script lang="ts">
    import { onMount } from "svelte";
    import Button from "./button.svelte";
    import Play from "lucide-svelte/icons/play";

    const sources = [
        // These videos are obviously under their own licenses, not part of mine
        "https://github.com/kingdomkind/kingdomkind.github.io/releases/download/Asset/1984.webm",
        "https://github.com/kingdomkind/kingdomkind.github.io/releases/download/Asset2/DuranDuran.webm",
        // End license exception block
    ];
    let players: [HTMLVideoElement, HTMLVideoElement] = [null!, null!];
    let currentSourcePlaying = 0;
    let currentPlayer = $state(0);
    let TRANSITION_DURATION = 2;
    let swapping = false;

    let toggling = $state(false);
    let toggled = $state(false);

    async function onTimeUpdate(index: number) {
        let oldPlayer = players[index];

        // Metadata may not be loaded, guard against it
        if (isNaN(oldPlayer.duration) || isNaN(oldPlayer.currentTime)) return;
        // Only start swapping if we're within TRANSITION_DURATION second of the end
        if (oldPlayer.duration - oldPlayer.currentTime > TRANSITION_DURATION)
            return;
        // Only continue if we're not already swapping
        if (swapping) return;
        swapping = true;

        currentPlayer = (index + 1) % 2;
        let newPlayer = players[currentPlayer];

        newPlayer.play();
        newPlayer.style.opacity = "1";
        currentSourcePlaying = (currentSourcePlaying + 1) % sources.length;
        oldPlayer.style.opacity = "0";
        await new Promise((resolve) =>
            setTimeout(resolve, TRANSITION_DURATION * 1000),
        );
        oldPlayer.src = `${sources[(currentSourcePlaying + 1) % sources.length]}`;
        oldPlayer.load();
        swapping = false;
    }

    onMount(() => {
        players[0].load();
        players[1].load();
        players[1].style.opacity = "0";
    });
</script>

{#if toggled === false}
    <div class="curtain-container">
        <svg
            class="curtain left {toggling ? 'left-open' : ''}"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <!-- Top left is 0,0 -->
            <polygon points="0,0 100,0 80,100 0,100" />
        </svg>

        <svg
            class="curtain right {toggling ? 'right-open' : ''}"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <polygon points="20,0 100,0 100,100 0,100" />
        </svg>

        <Button
            class={toggling ? "spin fade" : ""}
            onclick={() => {
                toggling = true;
                players[0].play();
                setTimeout(() => (toggled = true), 600);
            }}><Play /></Button
        >
    </div>
{/if}

{#each [0, 1] as i}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
        src={sources[i]}
        bind:this={players[i]}
        ontimeupdate={i === currentPlayer ? () => onTimeUpdate(i) : null}
        style="transition: opacity {TRANSITION_DURATION}s ease;"
    ></video>
{/each}

<style>
    .curtain-container {
        position: fixed;
        inset: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .curtain {
        position: absolute;
        top: 0;
        width: 60%;
        height: 100%;
        transition: transform 0.6s ease;
    }

    .left {
        left: 0;
    }
    .right {
        right: 0;
    }

    .left-open {
        transform: translateX(-100%);
    }

    .right-open {
        transform: translateX(100%);
    }

    :global(.fade) {
        transition: opacity 0.6s ease;
        opacity: 0;
    }

    video {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
