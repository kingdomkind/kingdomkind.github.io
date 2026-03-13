<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource/cascadia-code/400.css';
	import '@fontsource/cascadia-code/600.css';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
