<script lang="ts">
    let {
        src,
        front,
        opacity,
        onTimeUpdate,
        onEnded,
        element = $bindable(null),
    }: {
        src: string;
        front: boolean;
        opacity: number;
        onTimeUpdate: () => void;
        onEnded: () => void;
        element: HTMLVideoElement | null;
    } = $props();
</script>

<video
    class="bg-video"
    class:front
    bind:this={element}
    {src}
    muted
    playsinline
    preload="auto"
    ontimeupdate={onTimeUpdate}
    onended={onEnded}
    style="opacity: {opacity};"
></video>

<style>
    .bg-video {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
        transition: opacity 150ms linear;
    }
    .bg-video.front { z-index: 0; }
</style>
