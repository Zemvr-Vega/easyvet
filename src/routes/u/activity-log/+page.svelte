<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import { Activity, Search, Filter } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search_input  = $state(data.search);
	let cat_filter    = $state(data.category);
	let level_filter  = $state(data.level);

	const categories = [
		'customer','animal','appointment','consultation','vaccination',
		'laboratory','surgery','hospitalization','billing','inventory','user','doctor','system'
	];
	const levels = ['info','success','warning','error'];

	const level_badge: Record<string,string> = {
		info: 'badge-info', success: 'badge-success', warning: 'badge-warning', error: 'badge-error'
	};

	const action_icon: Record<string,string> = {
		created: '✨', updated: '✏️', deleted: '🗑️', archived: '📦', restored: '♻️',
		admitted: '🏥', discharged: '🚪', paid: '💳', cancelled: '❌', completed: '✅',
		administered: '💉', scheduled: '📅', viewed: '👁️', exported: '📤',
		login: '🔐', logout: '🔒'
	};

	function doSearch() {
		const p = new URLSearchParams();
		if (search_input) p.set('q', search_input);
		if (cat_filter)   p.set('category', cat_filter);
		if (level_filter) p.set('level', level_filter);
		p.set('page','1'); p.set('size', String(data.size));
		goto(`/u/activity-log?${p}`);
	}
</script>

<svelte:head><title>EasyVet — Activity Log</title></svelte:head>

<div class="ev-page">
	<!-- Header -->
	<div class="flex items-center justify-between ev-fade-up">
		<div class="flex items-center gap-3">
			<div class="rounded-lg bg-primary/10 p-2">
				<Activity class="size-5 text-primary" strokeWidth={1.75} />
			</div>
			<div>
				<h1 class="text-base font-bold text-base-content">Activity Log</h1>
				<p class="text-xs text-base-content/45 mt-0.5">{data.total} total events</p>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-2 ev-fade-up ev-d1">
		<div class="ev-search-wrap w-52">
			<Search />
			<input type="text" class="ev-search" placeholder="Search events..."
				bind:value={search_input}
				onkeydown={(e) => e.key === 'Enter' && doSearch()} />
		</div>
		<select class="select select-sm" bind:value={cat_filter} onchange={doSearch}>
			<option value="">All categories</option>
			{#each categories as c}
				<option value={c} class="capitalize">{c}</option>
			{/each}
		</select>
		<select class="select select-sm" bind:value={level_filter} onchange={doSearch}>
			<option value="">All levels</option>
			{#each levels as l}
				<option value={l} class="capitalize">{l}</option>
			{/each}
		</select>
		{#if data.search || data.category || data.level}
			<a href="/u/activity-log" class="btn btn-sm btn-ghost text-xs text-base-content/40">Clear</a>
		{/if}
	</div>

	<!-- Table -->
	<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden ev-fade-up ev-d2">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<table class="ev-table">
				<thead>
					<tr>
						<th>Event</th>
						<th>Category</th>
						<th>Action</th>
						<th>Target</th>
						<th>Performed By</th>
						<th>Level</th>
						<th>Date & Time</th>
					</tr>
				</thead>
				<tbody>
					{#each data.logs as log}
						<tr>
							<td class="max-w-64">
								<div class="flex items-start gap-2">
									<span class="text-base leading-none mt-0.5 flex-shrink-0">
										{action_icon[log.action] ?? '📋'}
									</span>
									<p class="text-xs text-base-content/80 leading-relaxed">{log.description}</p>
								</div>
							</td>
							<td>
								<span class="badge badge-ghost badge-xs capitalize">{log.category}</span>
							</td>
							<td>
								<span class="text-xs capitalize text-base-content/60">{log.action}</span>
							</td>
							<td class="text-xs text-base-content/55 max-w-32 truncate">
								{log.target_label || log.target_id || '—'}
							</td>
							<td class="text-xs text-base-content/60">{log.performed_by || 'System'}</td>
							<td>
								<span class="badge badge-xs {level_badge[log.level]} capitalize">{log.level}</span>
							</td>
							<td class="text-xs text-base-content/45 whitespace-nowrap">
								{date.formatDate({ date: log.createdAt, format: 'MMM dd, yyyy hh:mm aa' })}
							</td>
						</tr>
					{:else}
						<tr><td colspan="7">
							<div class="ev-empty">
								<Activity class="size-8" />
								<p class="text-sm font-medium">No activity found</p>
								<p class="text-xs">Events will appear here as actions are performed</p>
							</div>
						</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="ev-fade-up ev-d3"><Pagination total={data.total} /></div>
</div>
