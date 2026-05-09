<script lang="ts">
	import { page as url_page } from '$app/state';
	import { gotoWithParams } from '$lib/utils/helper';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { total }: { total: number } = $props();

	// Read page/size from URL — fall back to safe defaults when params are absent
	// Number(null) = 0, so we guard with || to prevent division-by-zero
	let page = $derived(Math.max(1, Number(url_page.url.searchParams.get('page')) || 1));
	let size = $derived(Math.max(1, Number(url_page.url.searchParams.get('size')) || 10));

	// Total pages — guaranteed ≥ 1 so the select always has at least one option
	let total_pages = $derived(Math.max(1, Math.ceil(total / size)));

	// "X to Y of Z" display range
	let range_to = $derived(Math.min(page * size, total));
	let range_from = $derived(total > 0 ? (page - 1) * size + 1 : 0);
</script>

<div class="flex flex-row items-center justify-between gap-2 text-xs">
	<!-- Result count -->
	<div class="w-36 text-base-content/50">
		{#if total > 0}
			{range_from}–{range_to} of {total}
		{:else}
			No results
		{/if}
	</div>

	<!-- Page navigation -->
	<div class="join">
		<button
			class="btn join-item btn-soft btn-sm btn-primary"
			disabled={page <= 1}
			onclick={() =>
				updateQueryParam([
					{ key: 'page', value: page - 1 },
					{ key: 'size', value: size }
				])}
			aria-label="Previous page"
		>
			<ChevronLeft class="size-4" />
		</button>

		<select
			class="select join-item w-fit min-w-24 select-sm select-primary"
			value={page}
			onchange={(e) =>
				updateQueryParam([
					{ key: 'page', value: Number(e.currentTarget.value) },
					{ key: 'size', value: size }
				])}
		>
			{#each { length: total_pages } as _, i}
				<option value={i + 1} selected={page === i + 1}>Page {i + 1}</option>
			{/each}
		</select>

		<button
			class="btn join-item btn-soft btn-sm btn-primary"
			disabled={page >= total_pages}
			onclick={() =>
				updateQueryParam([
					{ key: 'page', value: page + 1 },
					{ key: 'size', value: size }
				])}
			aria-label="Next page"
		>
			<ChevronRight class="size-4" />
		</button>
	</div>

	<!-- Per-page size selector -->
	<div class="flex w-36 flex-row items-center justify-end gap-2">
		<select
			class="select w-fit min-w-16 select-sm select-primary"
			value={size}
			onchange={(e) =>
				gotoWithParams([
					{ key: 'page', value: 1 },
					{ key: 'size', value: Number(e.currentTarget.value) }
				])}
		>
			<option value={10}>10 / page</option>
			<option value={25}>25 / page</option>
			<option value={50}>50 / page</option>
		</select>
	</div>
</div>
