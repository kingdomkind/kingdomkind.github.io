<script lang="ts">
    import RotatingCard from "$lib/components/rotating-card.svelte";
    import TooltipButton from "$lib/components/tooltip-button.svelte";
    import VideoPlayer from "$lib/components/video-player.svelte";
    import Icon from "@iconify/svelte";

    // If no url is specified, it is copied to clipboard
    const buttons = [
        {
            icon: "simple-icons:github",
            text: "Github",
            username: "@kingdomkind",
            url: "https://github.com/kingdomkind",
        },
        {
            icon: "simple-icons:x",
            text: "Twitter",
            username: "@_kingdomkind",
            url: "https://twitter.com/_kingdomkind",
        },
        {
            icon: "simple-icons:youtube",
            text: "Youtube",
            username: "@kingdomkind",
            url: "https://www.youtube.com/@kingdomkind",
        },
        {
            icon: "simple-icons:discord",
            text: "Discord",
            username: "@_kingdomkind",
        },
    ];
</script>

<VideoPlayer />

<div class="container">
    <RotatingCard>
        <div class="profile">
            <img
                class="avatar"
                src="https://github.com/kingdomkind.png?size=460"
                alt="Mi profile avatar"
            />
            <div class="info">
                <div class="title">
                    <h2>kingdomkind</h2>
                    <span class="mirrored" aria-hidden="true">pika</span>
                </div>
                <p>Da one and da only.</p>
            </div>
        </div>

        <div class="buttons">
            {#each buttons as button}
                <TooltipButton
                    class="equal"
                    tooltip={button.username}
                    clickedTooltip={button.url
                        ? "Opened url!"
                        : "Copied to clibpoard!"}
                    onclick={() => {
                        if (button.url) {
                            // Open in new tab
                            window.open(button.url, "_blank");
                        } else {
                            // This returns a promise, so we should be awaiting
                            // but realistically it'll be fine
                            navigator.clipboard.writeText(button.username);
                        }
                    }}
                >
                    <div class="icon">
                        <Icon icon={button.icon} width={16} />
                        {button.text}
                    </div>
                </TooltipButton>
            {/each}
        </div>
    </RotatingCard>
</div>

<style>
    .container {
        padding: 2rem;
        overflow: hidden; /* Ocassionally, the tilting can overflow */
    }

    .buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .profile {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        margin-bottom: 1.75rem;
    }

    .avatar {
        width: 35%;
        aspect-ratio: 1;
        border-radius: 1rem;
        border: 1px solid var(--color-border);
        transition: border-color var(--transition-color);
    }

    .info {
        flex: 1;
    }

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.4rem;
    }

    .mirrored {
        font-size: 1.2rem;
        transform: scaleX(-1);
    }

    :global(.equal) {
        flex: 1;
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        flex-shrink: 0;
        gap: 0.5rem;
    }
</style>
