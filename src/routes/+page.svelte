<script lang="ts">
    import Card from "$lib/components/card.svelte";
    import ThemeToggle from "$lib/components/theme-toggle.svelte";
    import Profile from "$lib/components/profile.svelte";
    import Player from "$lib/components/player.svelte";

    const VIDEOS = [
        // These videos are obviously under their own licenses, not part of mine
        "https://github.com/kingdomkind/kingdomkind.github.io/releases/download/Asset/1984.webm",
        "https://github.com/kingdomkind/kingdomkind.github.io/releases/download/Asset2/DuranDuran.webm",
        // End license exception block
    ];
</script>

<div class="page">
    <Player videos={VIDEOS} />

    <header>
        <ThemeToggle />
    </header>

    <Card>
        <Profile />
    </Card>
</div>

<style>
    :global(body) {
        margin: 0;
    }

    .page {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 100vh;
        color: var(--color-text);
    }

    header {
        position: fixed;
        top: 1rem;
        right: 1rem;
    }
</style>
