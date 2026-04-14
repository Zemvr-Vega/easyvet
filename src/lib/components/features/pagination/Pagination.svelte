<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as url_page } from '$app/state';
	import { updateQueryParam } from '$lib/utils/helper';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { total } = $props();

	let { page, size } = $state({
		page: 1,
		size: 10
	});

	//total pages for page select
	let total_pages = $derived(() => Math.ceil(total / size));

	// [from] to [to] of [total] results
	let current_page_size_to = $derived.by(() => {
		let _to = page * size;
		return _to <= total ? _to : total;
	});

	let current_page_size_from = $derived(() => page * size - size + 1);

	$effect(() => {
		page = Number(url_page.url.searchParams.get('page'));
		size = Number(url_page.url.searchParams.get('size'));
	});
</script>

<div class="flex flex-row justify-between">
	<div class="flex w-36 flex-row items-center justify-start">
		<p class="text-xs">
			{#if total > 0}
				{current_page_size_from()} to {current_page_size_to} of {total} results
			{:else}
				No results
			{/if}
		</p>
	</div>

	<div class="join">
		<button
			class="btn join-item btn-soft btn-sm btn-primary"
			class:btn-disabled={page == 1}
			onclick={() =>
				updateQueryParam([
					{ key: 'page', value: page - 1 },
					{ key: 'size', value: size }
				])}
		>
			<ChevronLeft class="size-4" />
		</button>

		<select
			class="select w-fit min-w-24 select-sm select-primary"
			bind:value={page}
			onchange={(e) =>
				updateQueryParam([
					{ key: 'page', value: e.currentTarget.value },
					{ key: 'size', value: size }
				])}
		>
			{#each { length: total_pages() }, index}
				<option value={index + 1}>Page {index + 1}</option>
			{/each}
		</select>

		<button
			class="btn join-item btn-soft btn-sm btn-primary"
			class:btn-disabled={page == total_pages()}
			onclick={() =>
				updateQueryParam([
					{ key: 'page', value: page + 1 },
					{ key: 'size', value: size }
				])}
		>
			<ChevronRight class="size-4" />
		</button>
	</div>

	<div class="flex w-36 flex-row items-center justify-end gap-2">
		<select
			class="select w-fit min-w-16 select-sm select-primary"
			bind:value={size}
			onchange={(e) =>
				updateQueryParam([
					{ key: 'page', value: 1 },
					{ key: 'size', value: e.currentTarget.value }
				])}
		>
			<option value={10}>10 per page</option>
			<option value={25}>25 per page</option>
			<option value={50}>50 per page</option>
		</select>
	</div>
</div>
