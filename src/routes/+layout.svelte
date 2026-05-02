<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import NavProgress from '$lib/components/ui/NavProgress.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>EasyVet</title>
</svelte:head>

<!-- Navigation progress bar (slim top line during page transitions) -->
<NavProgress />

<!--
	svelte-sonner Toaster — mounted once here so toasts work on every page.
	theme prop syncs with the user's dark/light toggle.
	richColors   = semantic colors per type (success=green, error=red, etc.)
	closeButton  = shows X on each toast
	expand       = expand on hover to show full message
	position     = bottom-right (standard for management apps)
-->
<Toaster
	position="bottom-right"
	richColors
	closeButton
	expand={false}
	theme={theme.isDark ? 'dark' : 'light'}
	toastOptions={{
		style: 'font-family: Inter, system-ui, sans-serif; font-size: 0.82rem; border-radius: 0.6rem;',
		duration: 4000,
		class: 'ev-toast'
	}}
/>

{@render children()}
