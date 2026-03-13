<script lang="ts">
  import { Sun, Moon } from "lucide-svelte";

  type Theme = "dark" | "gold";
  const themes: Theme[] = ["gold", "dark"];

  let themeIndex = $state(
    Math.max(themes.indexOf(localStorage.getItem("theme") as Theme), 0),
  );
  let spinning = $state(false);

  function toggle() {
    spinning = true;
    setTimeout(() => {
      themeIndex = (themeIndex + 1) % themes.length;
    }, 150);
    setTimeout(() => spinning = false, 300);
  }

  $effect(() => {
    document.documentElement.setAttribute("data-theme", themes[themeIndex]);
    localStorage.setItem("theme", themes[themeIndex]);
  });
</script>

<button
  onclick={toggle}
  class="toggle glass glass-blur hoverable"
  class:spin={spinning}
  aria-label="Toggle theme"
>
  {#if themes[themeIndex] === "dark"}
    <Moon size={18} />
  {:else}
    <Sun size={18} />
  {/if}
</button>

<style>
  .toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 30%;
    color: var(--color-text);
    cursor: pointer;
    transition: background-color var(--transition-color), border-radius var(--transition-color), color var(--transition-color), border-color var(--transition-color);
  }
  .toggle:hover { border-radius: 40%; }
</style>
