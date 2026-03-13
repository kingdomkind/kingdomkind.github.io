<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<div class="tooltip" role="tooltip">{text}</div>

<style>
  .tooltip {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms ease, transform 150ms ease;
  }
</style>
