<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { CirclePlus, Search, PawPrint } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search_input = $state(data.search);
	let species_input = $state(data.species_filter);

	const species_list = ['dog','cat','bird','rabbit','reptile','fish','other'];
	const species_emoji: Record<string,string> = {
		dog:'🐕', cat:'🐈', bird:'🦜', rabbit:'🐇', reptile:'🦎', fish:'🐟', other:'🐾'
	};
	const vacc_badge: Record<string,string> = {
		'up-to-date': 'badge-success', overdue: 'badge-error', unknown: 'badge-ghost'
	};

	function doSearch() {
		const p = new URLSearchParams();
		if (search_input) p.set('q', search_input);
		if (species_input) p.set('species', species_input);
		p.set('page','1'); p.set('size', String(data.size));
		goto(`/u/animals?${p}`);
	}

	function getAge(dob: string) {
		const birth = new Date(dob), now = new Date();
		const y = now.getFullYear() - birth.getFullYear();
		const m = now.getMonth() - birth.getMonth();
		if (y === 0) return `${Math.max(0,m)}mo`;
		if (y < 2) return `${y}y ${Math.abs(m)}mo`;
		return `${y}y`;
	}
</script>

<svelte:head><title>EasyVet — Animals</title></svelte:head>

<div class="ev-page">

	<!-- Header -->
	<div class="flex items-center justify-between ev-fade-up">
		<div>
			<h1 class="text-base font-bold text-base-content">Animals</h1>
			<p class="text-xs text-base-content/40 mt-0.5">{data.total} patients registered</p>
		</div>
		<a href={resolve('/u/animals/new')} class="btn btn-sm btn-primary gap-1.5 shadow-sm">
			<CirclePlus class="size-3.5" strokeWidth={2.5} /> Register Animal
		</a>
	</div>

	<!-- Filters -->
	<form onsubmit={(e) => { e.preventDefault(); doSearch(); }} class="flex items-center gap-2 ev-fade-up ev-d1">
		<div class="ev-search-wrap flex-1 max-w-xs">
			<Search />
			<input type="text" class="ev-search" placeholder="Search by name or breed..." bind:value={search_input} />
		</div>
		<select
			class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs"
			bind:value={species_input}
			onchange={doSearch}
		>
			<option value="">All species</option>
			{#each species_list as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
		<button type="submit" class="btn btn-sm btn-ghost text-xs">Search</button>
		{#if data.search || data.species_filter}
			<a href="/u/animals" class="btn btn-sm btn-ghost text-xs text-base-content/40">Clear</a>
		{/if}
	</form>

	<!-- Table -->
	<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden ev-fade-up ev-d2">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<table class="ev-table">
				<thead>
					<tr>
						<th>Animal</th>
						<th>Owner</th>
						<th>Age</th>
						<th>Vaccination</th>
						<th>Visits</th>
						<th>Last Visit</th>
					</tr>
				</thead>
				<tbody>
					{#each data.animals as animal}
						<tr class="cursor-pointer" onclick={() => goto(resolve(`/u/animals/${animal._id}`))}>
							<td>
								<div class="flex items-center gap-2.5">
									<span class="text-xl leading-none">{species_emoji[animal.species] ?? '🐾'}</span>
									<div>
										<p class="font-semibold text-base-content">{animal.name}</p>
										<p class="text-[0.7rem] text-base-content/40 capitalize">{animal.species} · {animal.breed}</p>
									</div>
								</div>
							</td>
							<td>
								<p class="text-base-content/70">{animal.customer_id?.firstname ?? '—'} {animal.customer_id?.lastname ?? ''}</p>
								<p class="text-[0.7rem] text-base-content/40">{animal.customer_id?.contact_number ?? ''}</p>
							</td>
							<td class="text-base-content/60 tabular-nums">{getAge(animal.dob)}</td>
							<td>
								<span class="badge badge-xs {vacc_badge[animal.vaccination_status]} capitalize">
									{animal.vaccination_status.replace('-',' ')}
								</span>
							</td>
							<td>
								<span class="badge badge-ghost badge-sm tabular-nums">{animal.medical_records?.length ?? 0}</span>
							</td>
							<td class="text-base-content/45">
								{#if animal.medical_records?.length}
									{date.formatDate({ date: animal.medical_records.at(-1).createdAt, format: 'MMM dd, yyyy' })}
								{:else}—{/if}
							</td>
						</tr>
					{:else}
						<tr><td colspan="6">
							<div class="ev-empty">
								<PawPrint class="size-8" />
								<p class="text-sm font-medium">No animals found</p>
							</div>
						</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="ev-fade-up ev-d3"><Pagination total={data.total} /></div>
</div>
