<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { Archive, CirclePlus, Pencil, Search, SquareArrowOutUpRight, Users } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selected_row = $state('');
	let search_input = $state(data.search);

	function doSearch() {
		const p = new URLSearchParams();
		if (search_input) p.set('q', search_input);
		p.set('page', '1');
		p.set('size', String(data.size));
		goto(`/u/customers?${p}`);
	}

	function fullAddress(c: (typeof data.customers)[0]) {
		return [c.address_barangay, c.address_city, c.address_province].filter(Boolean).join(', ');
	}
</script>

<svelte:head><title>EasyVet — Customers</title></svelte:head>

<div class="ev-page">

	<!-- Header -->
	<div class="flex items-center justify-between ev-fade-up">
		<div>
			<h1 class="text-base font-bold text-base-content">Customers</h1>
			<p class="text-xs text-base-content/40 mt-0.5">{data.total} registered clients</p>
		</div>
		<a href={resolve('/u/customers/new')} class="btn btn-sm btn-primary gap-1.5 shadow-sm">
			<CirclePlus class="size-3.5" strokeWidth={2.5} /> Add Customer
		</a>
	</div>

	<!-- Search bar -->
	<form onsubmit={(e) => { e.preventDefault(); doSearch(); }} class="flex items-center gap-2 ev-fade-up ev-d1">
		<div class="ev-search-wrap flex-1 max-w-sm">
			<Search />
			<input
				type="text"
				class="ev-search"
				placeholder="Search by name, email or contact..."
				bind:value={search_input}
			/>
		</div>
		<button type="submit" class="btn btn-sm btn-ghost text-xs">Search</button>
		{#if data.search}
			<a href="/u/customers" class="btn btn-sm btn-ghost text-xs text-base-content/40">Clear</a>
		{/if}
	</form>

	<!-- Table -->
	<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden ev-fade-up ev-d2">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<table class="ev-table">
				<thead>
					<tr>
						<th class="w-0 p-0"></th>
						<th>Name</th>
						<th>Contact</th>
						<th>Address</th>
						<th>Pets</th>
					</tr>
				</thead>
				<tbody>
					{#each data.customers as customer (customer._id)}
						<tr
							class="relative cursor-pointer {selected_row === customer._id ? 'bg-base-200/60' : ''}"
							onclick={() => selected_row = selected_row === customer._id ? '' : customer._id}
						>
							<!-- Slide-in action bar -->
							{#key selected_row}
								<td
									class="absolute inset-y-0 left-0 z-10 flex items-center
										{selected_row === customer._id ? 'w-full px-4 bg-neutral/80 backdrop-blur-sm' : 'w-0 p-0'}"
									in:slide={{ duration: 280, axis: 'x' }}
									out:slide={{ duration: 200, delay: 80, axis: 'x' }}
								>
									{#if selected_row === customer._id}
										<div class="flex gap-1.5" in:slide={{ axis: 'x', duration: 200 }}>
											<a
												href={resolve(`/u/customers/${customer._id}`)}
												class="btn btn-xs btn-soft btn-primary gap-1"
												onclick={(e) => e.stopImmediatePropagation()}
											>
												<SquareArrowOutUpRight class="size-3" /> View
											</a>
											<a
												href={resolve(`/u/customers/${customer._id}/edit`)}
												class="btn btn-xs btn-soft btn-accent gap-1"
												onclick={(e) => e.stopImmediatePropagation()}
											>
												<Pencil class="size-3" /> Edit
											</a>
											<form method="POST" action="?/archive" onclick={(e) => e.stopImmediatePropagation()}>
												<input type="hidden" name="id" value={customer._id} />
												<button
													class="btn btn-xs btn-soft btn-error gap-1"
													type="submit"
													onclick={(e) => { e.stopImmediatePropagation(); if (!confirm('Archive this customer?')) e.preventDefault(); }}
												>
													<Archive class="size-3" /> Archive
												</button>
											</form>
										</div>
									{/if}
								</td>
							{/key}
							<td class="font-semibold text-base-content">
								{customer.firstname} {customer.lastname}
							</td>
							<td class="text-base-content/60">{customer.contact_number || '—'}</td>
							<td class="text-base-content/60 max-w-48 truncate">{fullAddress(customer) || '—'}</td>
							<td>
								<span class="badge badge-ghost badge-sm">{customer.pet_count}</span>
							</td>
						</tr>
					{:else}
						<tr><td colspan="5">
							<div class="ev-empty">
								<Users class="size-8" />
								<p class="text-sm font-medium">No customers found</p>
								{#if data.search}<p class="text-xs">Try a different search term</p>{/if}
							</div>
						</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="ev-fade-up ev-d3">
		<Pagination total={data.total} />
	</div>
</div>
