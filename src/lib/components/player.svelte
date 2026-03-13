<script lang="ts">
    /* This file is slop, but it'll be blown up anyway once we add multiple pages */
    import { onMount } from "svelte";
    import { Play, Pause, Volume2, VolumeX } from "lucide-svelte";
    import Glare from "$lib/components/glare.svelte";
    import VideoLayer from "$lib/components/video-layer.svelte";
    import IconButton from "$lib/components/icon-button.svelte";
    import Curtains from "$lib/components/curtains.svelte";

    type WaveShape = {
        waveLen: number;
        phase: number;
        amplitude: number;
        direction: number;
    };

    type GhostWave = WaveShape & {
        active: boolean;
        handle: number;
        opacity: number;
    };

    let { videos }: { videos: string[] } = $props();

    const CROSSFADE_MS = 3000;
    const crossfadeSecs = CROSSFADE_MS / 1000;

    let videoA = $state<HTMLVideoElement | null>(null);
    let videoB = $state<HTMLVideoElement | null>(null);
    let sourceA = $state("");
    let sourceB = $state("");

    let activeSlot = $state(0);
    let nextIndex = $state(0);
    let fade = $state(0);
    let isCrossfading = $state(false);
    let direction = $state(1);

    let started = $state(false);
    let curtainsHidden = $state(false);
    let userPaused = $state(false);
    let userMuted = $state(false);

    type PlaybackUi = {
        playing: boolean;
        muted: boolean;
        playSpinning: boolean;
        muteSpinning: boolean;
    };

    let playbackUi = $state<PlaybackUi>({
        playing: false,
        muted: true,
        playSpinning: false,
        muteSpinning: false,
    });
    let displayProgress = $state(0); // visual handle position (0–1, always L→R)
    let videoProgress = $state(0); // actual video progress  (0–1)
    let currentTime = $state(0); // raw seconds, drives wave phase
    let duration = $state(0);
    let dragging = $state(false);

    let ghost = $state<GhostWave>({
        active: false,
        handle: 0,
        direction: 1,
        phase: 0,
        amplitude: 0,
        opacity: 0,
        waveLen: 24,
    });

    let timeline: HTMLDivElement;
    let svgWidth = $state(0);
    let rafId: number;

    let playerInner: HTMLDivElement;

    const WAVE_HEIGHT = 3;
    const CENTER_Y = 8;
    const SINE_POINTS = 200;
    const WAVE_CYCLES = 8;
    const WAVE_SPEED_CYCLES = 1;

    let activeVideo = $derived<HTMLVideoElement | null>(
        activeSlot === 0 ? videoA : videoB,
    );

    // Opacities for the cross fade animations
    let opacityA = $derived(started ? (activeSlot === 0 ? 1 - fade : fade) : 0);
    let opacityB = $derived(started ? (activeSlot === 0 ? fade : 1 - fade) : 0);

    let waveLen = $derived(svgWidth > 0 ? svgWidth / WAVE_CYCLES : 24);

    // Wave movement
    let phase = $derived(
        svgWidth > 0
            ? (currentTime * WAVE_SPEED_CYCLES * waveLen) % waveLen
            : 0,
    );
    let wave: WaveShape = $derived({
        waveLen,
        phase,
        amplitude: WAVE_HEIGHT,
        direction,
    });

    // The entire wave is actually showing; we just clip part of it.
    // The "ghost" is the grey wave that lingers after a transition.
    let clipLeft = $derived(direction === 1 ? 0 : displayProgress * 100);
    let clipRight = $derived(direction === 1 ? displayProgress * 100 : 100);
    let greyLeft = $derived(direction === 1 ? displayProgress * 100 : 0);
    let greyRight = $derived(direction === 1 ? 100 : displayProgress * 100);
    let ghostClipLeft = $derived(
        ghost.direction === 1 ? 0 : ghost.handle * 100,
    );
    let ghostClipRight = $derived(
        ghost.direction === 1 ? ghost.handle * 100 : 100,
    );

    function lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }

    function formatTime(secs: number) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${s}`;
    }

    // Draws the sine wave
    function sinePath(
        width: number,
        wl: number,
        phaseOffset: number,
        amplitude: number,
        flip: number,
    ): string {
        if (width <= 0) return "";
        let d = "";
        for (let i = 0; i <= SINE_POINTS; i++) {
            const x = (i / SINE_POINTS) * width;
            const y =
                CENTER_Y +
                Math.sin((x + phaseOffset) * ((2 * Math.PI) / wl)) *
                    amplitude *
                    flip;
            d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        return d;
    }

    function getActive(): HTMLVideoElement | null {
        return activeSlot === 0 ? videoA : videoB;
    }
    function getInactive(): HTMLVideoElement | null {
        return activeSlot === 0 ? videoB : videoA;
    }

    function preloadNext() {
        if (videos.length < 2) return;
        const inactive = getInactive();
        if (activeSlot === 0) sourceB = videos[nextIndex];
        else sourceA = videos[nextIndex];
        inactive?.load();
    }

    function start() {
        started = true;
        const active = getActive();
        const inactive = getInactive();

        if (active) {
            active.currentTime = 0;
            active.muted = userMuted;
            active.volume = userMuted ? 0 : 1;
            active.play();
        }

        if (inactive) {
            inactive.muted = true;
            inactive.volume = 0;
            inactive.pause();
        }

        setTimeout(() => (curtainsHidden = true), 1000);
    }

    function startCrossfade() {
        if (isCrossfading || videos.length < 2) return;
        const from = getActive();
        const to = getInactive();
        if (!from || !to) return;
        const fromVideo = from;
        const toVideo = to;

        isCrossfading = true;
        fade = 0;
        toVideo.currentTime = 0;
        toVideo.muted = !started || userMuted;
        toVideo.volume = 0;
        toVideo.play();

        const startTime = performance.now();
        function step(now: number) {
            const progress = Math.min((now - startTime) / CROSSFADE_MS, 1);
            fade = progress;
            if (started && !userMuted) {
                const fromVol = Math.max(0, Math.min(1, 1 - progress));
                const toVol = Math.max(0, Math.min(1, progress));
                fromVideo.volume = fromVol;
                toVideo.volume = toVol;
            }
            progress < 1
                ? requestAnimationFrame(step)
                : finalizeCrossfade(fromVideo, toVideo);
        }
        requestAnimationFrame(step);
    }

    function finalizeCrossfade(from: HTMLVideoElement, to: HTMLVideoElement) {
        ghost.handle = displayProgress;
        ghost.direction = direction;
        ghost.phase = phase;
        ghost.waveLen = waveLen;
        ghost.amplitude = WAVE_HEIGHT;
        ghost.opacity = 1;
        ghost.active = true;

        from.pause();
        from.volume = 0;
        activeSlot = activeSlot === 0 ? 1 : 0;
        nextIndex = (nextIndex + 1) % videos.length;
        direction *= -1;
        preloadNext();
        isCrossfading = false;
        fade = 0;
        to.volume = started && !userMuted ? 1 : 0;
        to.muted = !started || userMuted;
    }

    function onVideoTimeUpdate(slot: number) {
        if (slot !== activeSlot || isCrossfading) return;
        const active = getActive();
        if (!active?.duration || !Number.isFinite(active.duration)) return;
        if (active.duration - active.currentTime <= crossfadeSecs)
            startCrossfade();
    }

    function onVideoEnded(slot: number) {
        if (slot === activeSlot) startCrossfade();
    }

    function resumeOnFocus() {
        if (!started || isCrossfading || userPaused) return;
        const active = getActive();
        if (!active) return;
        if (active.paused) active.play();
    }

    onMount(() => {
        const onFocus = () => {
            if (!document.hidden) resumeOnFocus();
        };
        document.addEventListener("visibilitychange", onFocus);
        window.addEventListener("focus", onFocus);
        return () => {
            document.removeEventListener("visibilitychange", onFocus);
            window.removeEventListener("focus", onFocus);
        };
    });

    $effect(() => {
        if (!videos.length) return;
        if (!sourceA) sourceA = videos[0];
        if (!sourceB) sourceB = videos.length > 1 ? videos[1] : videos[0];
        nextIndex = videos.length > 1 ? 1 : 0;
    });

    $effect(() => {
        if (!activeVideo) return;
        const current = activeVideo;

        playbackUi.playing = !current.paused;
        playbackUi.muted = current.muted;

        const onPlay = () => (playbackUi.playing = true);
        const onPause = () => (playbackUi.playing = false);
        const onVolumeChange = () => (playbackUi.muted = current.muted);

        current.addEventListener("play", onPlay);
        current.addEventListener("pause", onPause);
        current.addEventListener("volumechange", onVolumeChange);

        function tick() {
            if (!dragging && current.duration) {
                duration = current.duration;
                currentTime = current.currentTime;
                const target = current.currentTime / current.duration;
                videoProgress = target;
                const displayTarget = direction === 1 ? target : 1 - target;
                displayProgress = lerp(displayProgress, displayTarget, 0.12);
            }

            if (ghost.active) {
                ghost.amplitude = lerp(ghost.amplitude, 0, 0.05);
                ghost.opacity = lerp(ghost.opacity, 0, 0.05);
                if (ghost.opacity < 0.01) ghost.active = false;
            }

            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            current.removeEventListener("play", onPlay);
            current.removeEventListener("pause", onPause);
            current.removeEventListener("volumechange", onVolumeChange);
        };
    });

    function seek(e: MouseEvent) {
        if (!activeVideo) return;
        const rect = timeline.getBoundingClientRect();
        const rawX = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        const vp = direction === 1 ? rawX : 1 - rawX;
        displayProgress = rawX;
        videoProgress = vp;
        currentTime = vp * activeVideo.duration;
        activeVideo.currentTime = vp * activeVideo.duration;
        ghost.active = false;
    }

    function onMouseDown(e: MouseEvent) {
        dragging = true;
        seek(e);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }
    function onMouseMove(e: MouseEvent) {
        if (dragging) seek(e);
    }
    function onMouseUp() {
        dragging = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    function togglePlay() {
        if (!activeVideo) return;
        playbackUi.playSpinning = true;
        setTimeout(() => (playbackUi.playSpinning = false), 300);
        if (activeVideo.paused) {
            if (activeVideo.ended) activeVideo.currentTime = 0;
            userPaused = false;
            const playPromise = activeVideo.play();
            if (playPromise) {
                playPromise.catch((err) => {
                    if (err?.name !== "AbortError") {
                        console.error(err);
                    }
                });
            }
        } else {
            userPaused = true;
            activeVideo.pause();
        }
    }

    function toggleMute() {
        if (!activeVideo) return;
        playbackUi.muteSpinning = true;
        setTimeout(() => (playbackUi.muteSpinning = false), 300);
        userMuted = !userMuted;
        const active = getActive();
        const inactive = getInactive();
        if (active) {
            active.muted = userMuted;
            active.volume = userMuted ? 0 : 1;
        }
        if (inactive) {
            inactive.muted = userMuted;
            inactive.volume = 0;
        }
    }
</script>

<!-- background videos -->
<VideoLayer
    bind:element={videoA}
    src={sourceA}
    front={activeSlot === 0}
    opacity={opacityA}
    onTimeUpdate={() => onVideoTimeUpdate(0)}
    onEnded={() => onVideoEnded(0)}
/>
<VideoLayer
    bind:element={videoB}
    src={sourceB}
    front={activeSlot === 1}
    opacity={opacityB}
    onTimeUpdate={() => onVideoTimeUpdate(1)}
    onEnded={() => onVideoEnded(1)}
/>

<!-- curtain intro -->
<Curtains hidden={curtainsHidden} {started} onStart={start}>
    <Play size={28} />
</Curtains>

<!-- player bar -->
<div class="player glass glass-blur">
    <div class="player-inner" bind:this={playerInner} role="presentation">
        <Glare />
        <div class="player-content">
            <div class="controls">
                <IconButton
                    onclick={togglePlay}
                    spinning={playbackUi.playSpinning}
                    ariaLabel="Play/pause"
                >
                    {#if playbackUi.playing}
                        <Pause size={16} />
                    {:else}
                        <Play size={16} />
                    {/if}
                </IconButton>
                <IconButton
                    onclick={toggleMute}
                    spinning={playbackUi.muteSpinning}
                    ariaLabel="Mute/unmute"
                >
                    {#if playbackUi.muted}
                        <VolumeX size={16} />
                    {:else}
                        <Volume2 size={16} />
                    {/if}
                </IconButton>
            </div>

            <div
                class="timeline"
                bind:this={timeline}
                bind:clientWidth={svgWidth}
                onmousedown={onMouseDown}
                role="slider"
                tabindex="0"
                aria-valuenow={displayProgress * 100}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <svg class="track" height="16" width="100%">
                    <defs>
                        <clipPath id="wave-clip">
                            <rect
                                x="{clipLeft}%"
                                y="0"
                                width="{clipRight - clipLeft}%"
                                height="16"
                            />
                        </clipPath>
                        <clipPath id="ghost-clip">
                            <rect
                                x="{ghostClipLeft}%"
                                y="0"
                                width="{ghostClipRight - ghostClipLeft}%"
                                height="16"
                            />
                        </clipPath>
                    </defs>

                    <!-- unplayed track -->
                    <line
                        x1="{greyLeft}%"
                        y1="8"
                        x2="{greyRight}%"
                        y2="8"
                        stroke="currentColor"
                        stroke-opacity="0.2"
                        stroke-width="2"
                    />

                    <!-- ghost wave (fades out after transition) -->
                    {#if ghost.active}
                        <path
                            d={sinePath(
                                svgWidth,
                                ghost.waveLen,
                                ghost.phase,
                                ghost.amplitude,
                                ghost.direction,
                            )}
                            fill="none"
                            stroke="currentColor"
                            stroke-opacity={ghost.opacity}
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            clip-path="url(#ghost-clip)"
                        />
                    {/if}

                    <!-- active wave -->
                    <path
                        d={sinePath(
                            svgWidth,
                            wave.waveLen,
                            wave.phase,
                            wave.amplitude,
                            wave.direction,
                        )}
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        clip-path="url(#wave-clip)"
                    />
                </svg>

                <div
                    class="handle"
                    style="left: {displayProgress * 100}%"
                ></div>
            </div>

            <span class="time"
                >{formatTime(videoProgress * duration)} / {formatTime(
                    duration,
                )}</span
            >
        </div>
    </div>
</div>

<style>
    .player {
        position: fixed;
        bottom: 1.5rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        border-radius: 1rem;
        color: var(--color-text);
        width: clamp(18rem, 35vw, 28rem);
        user-select: none;
    }

    .player-inner {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 0.75rem;
        overflow: hidden;
        border-radius: inherit;
    }

    .player-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
    }

    .controls {
        display: flex;
        gap: 0.25rem;
        flex-shrink: 0;
    }

    .timeline {
        position: relative;
        flex: 1;
        height: 1.2rem;
        cursor: pointer;
    }

    .track {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        overflow: visible;
    }

    .time {
        opacity: 0.5;
        font-size: 0.7rem;
        flex-shrink: 0;
        white-space: nowrap;
    }

    .handle {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background: currentColor;
        pointer-events: none;
        z-index: 1;
        transition: transform var(--transition-transform);
    }

    .timeline:hover .handle {
        transform: translate(-50%, -50%) scale(1.15);
    }

    .controls {
        display: flex;
        gap: 0.5rem;
    }
</style>
