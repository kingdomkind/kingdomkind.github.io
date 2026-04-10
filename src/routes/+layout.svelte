<script lang="ts">
    import "@fontsource/cascadia-code/400.css";
    import "@fontsource/cascadia-code/600.css";
    import "../app.css";
    import Button from "$lib/components/button.svelte";
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";

    const themes = [
        { name: "gold", icon: Sun },
        { name: "dark", icon: Moon },
    ];

    let toggling = $state(false);
    let theme = $state(localStorage.getItem("theme") ?? "gold");
    let { children } = $props();

    $effect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    });
</script>

<div class="layout">
    <main class="content">
        {@render children()}
    </main>

    <div class="toolbar">
        <Button
            class={toggling ? "spin" : ""}
            onclick={() => {
                toggling = true;
                setTimeout(() => (toggling = false), 300);
                const currentIndex = themes.findIndex((t) => t.name === theme);
                theme = themes[(currentIndex + 1) % themes.length].name;
            }}
        >
            {@const ThemeIcon = themes.find((t) => t.name === theme)!.icon}

            <ThemeIcon></ThemeIcon>
        </Button>
    </div>
</div>

<style>
    .layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    .toolbar {
        position: fixed; /* We don't want to offset others' position */
        padding: 1rem;
    }

    .content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
