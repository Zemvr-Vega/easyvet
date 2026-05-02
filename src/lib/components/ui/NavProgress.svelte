<script lang="ts">
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { nav_progress } from '$lib/stores/nav-progress.svelte';

	beforeNavigate(() => nav_progress.start());
	afterNavigate(() => nav_progress.done());
</script>

{#if nav_progress.navigating || nav_progress.progress > 0}
	<div
		class="nav-progress-bar"
		style="width: {nav_progress.progress}%; opacity: {nav_progress.navigating ? 1 : 0}"
		aria-hidden="true"
	></div>
{/if}

<style>
	.nav-progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		height: 2px;
		background: var(--color-primary);
		z-index: 9999;
		transition: width 0.2s ease, opacity 0.3s ease;
		box-shadow: 0 0 8px color-mix(in oklch, var(--color-primary) 60%, transparent);
		border-radius: 0 999px 999px 0;
	}
</style>
