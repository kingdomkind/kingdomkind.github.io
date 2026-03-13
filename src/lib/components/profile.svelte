<script lang="ts">
    import Tooltip from "$lib/components/tooltip.svelte";
    import Button from "$lib/components/button.svelte";
    import Icon from "@iconify/svelte";

    type Social = {
        icon: string;
        label: string;
        href: string | null;
        username: string;
        copyOnClick: boolean;
    };

    const socials: Social[] = [
        {
            icon: "simple-icons:github",
            label: "GitHub",
            href: "https://github.com/kingdomkind",
            username: "@kingdomkind",
            copyOnClick: false,
        },
        {
            icon: "simple-icons:x",
            label: "Twitter",
            href: "https://twitter.com/_kingdomkind",
            username: "@_kingdomkind",
            copyOnClick: false,
        },
        {
            icon: "simple-icons:youtube",
            label: "YouTube",
            href: "https://www.youtube.com/@kingdomkind",
            username: "@kingdomkind",
            copyOnClick: false,
        },
        {
            icon: "simple-icons:discord",
            label: "Discord",
            href: null,
            username: "@kingdom.kind",
            copyOnClick: true,
        },
    ];

    let copiedIndex: number | null = $state(null);

    async function onCopy(username: string, index: number) {
        await navigator.clipboard.writeText(username);
        copiedIndex = index;
        setTimeout(() => (copiedIndex = null), 2000);
    }
</script>

<div class="container">
    <div class="profile">
        <img
            class="avatar"
            src="https://github.com/kingdomkind.png?size=460"
            alt="Profile"
        />
        <div class="info">
            <div class="title-row">
                <h2>kingdomkind</h2>
                <span class="mirrored" aria-hidden="true">pika</span>
            </div>
            <p>Da one and da only.</p>
        </div>
    </div>

    <div class="socials">
        {#each socials as social, i}
            <div class="social-item tooltip-host">
                <Button
                    href={social.href}
                    onclick={social.copyOnClick ? () => onCopy(social.username, i) : () => {}}
                >
                    <Tooltip
                        text={copiedIndex === i
                            ? "Copied to clipboard!"
                            : social.username}
                    />
                    <span class="icon">
                        <Icon icon={social.icon} width={16} />
                    </span>
                    {social.label}
                </Button>
            </div>
        {/each}
    </div>
</div>

<style>
    .container {
        width: clamp(20rem, 40vw, 35rem);
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
        object-fit: cover;
        object-position: top;
        flex-shrink: 0;
        border: 1px solid var(--color-border);
        transition: border-color var(--transition-color);
    }

    .info {
        flex: 1;
    }

    .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.4em;
    }

    .title-row h2 {
        margin: 0;
        font-size: 1.2rem;
    }

    .mirrored {
        font-size: 1.2rem;
        transform: scaleX(-1);
        display: inline-block;
    }

    .info p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.7;
        line-height: 1.6;
    }

    .socials {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: stretch;
    }

    .social-item {
        flex: 1 1 0;
    }

    .tooltip-host:hover :global(.tooltip) {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }

    @media (max-width: 32.5rem) {
        .socials {
            flex-direction: column;
        }
        .social-item {
            flex: 1 1 auto;
        }
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        line-height: 0;
        flex-shrink: 0;
    }

</style>
