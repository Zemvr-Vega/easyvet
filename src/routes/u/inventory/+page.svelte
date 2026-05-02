<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import Input from '$lib/components/ui/form/input/Input';
	import Message from '$lib/components/ui/form/message/Message.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { CirclePlus, TriangleAlert, X, PackagePlus, Archive, Search, Package } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import { formatPHP } from '$lib/constants';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { form: sf, errors, constraints, enhance: sfEnhance, message } = superForm(data.form, { delayMs: 300 });

	let show_add_modal    = $state(false);
	let show_restock_modal = $state(false);
	let restock_item: { id: string; name: string; current_qty: number } | null = $state(null);

	let search_query    = $state(data.search);
	let category_filter = $state(data.category);
	let low_stock_only  = $state(data.low_stock_only);

	function doSearch() {
		const p = new URLSearchParams();
		if (search_query)    p.set('q', search_query);
		if (category_filter) p.set('category', category_filter);
		if (low_stock_only)  p.set('low_stock', '1');
		p.set('page','1'); p.set('size', String(data.size));
		goto(`/u/inventory?${p}`);
	}

	let display_items = $derived(
		data.items.filter((item: typeof data.items[0]) => {
			if (!search_query) return true;
			const q = search_query.toLowerCase();
			return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q);
		})
	);

	const category_options = ['medicine','vaccine','supply','equipment','food','grooming'];
	const category_badge: Record<string,string> = {
		medicine:'badge-error', vaccine:'badge-success', supply:'badge-info',
		equipment:'badge-warning', food:'badge-secondary', grooming:'badge-neutral'
	};

	function isLowStock(item: typeof data.items[0]) { return item.quantity <= item.reorder_level; }
	function isExpiringSoon(item: typeof data.items[0]) {
		if (!item.expiration_date) return false;
		const days = (new Date(item.expiration_date).getTime() - Date.now()) / 86400000;
		return days <= 30 && days > 0;
	}
	function isExpired(item: typeof data.items[0]) {
		return item.expiration_date ? new Date(item.expiration_date) < new Date() : false;
	}

	$effect(() => {
		if ($message?.type === 'success') show_add_modal = false;
	});
</script>

<svelte:head><title>EasyVet — Inventory</title></svelte:head>

<div class="ev-page">

	<!-- Header -->
	<div class="flex items-center justify-between ev-fade-up">
		<div>
			<h1 class="text-base font-bold text-base-content">Inventory</h1>
			<p class="text-xs text-base-content/40 mt-0.5">{data.total} items · {data.low_stock_count} low stock</p>
		</div>
		<button class="btn btn-sm btn-primary gap-1.5 shadow-sm" onclick={() => (show_add_modal = true)}>
			<CirclePlus class="size-3.5" strokeWidth={2.5} /> Add Item
		</button>
	</div>

	<!-- Filters -->
	<div class="flex items-center gap-2 flex-wrap ev-fade-up ev-d1">
		<div class="ev-search-wrap w-56">
			<Search />
			<input
				type="text"
				class="ev-search"
				placeholder="Search name or SKU..."
				bind:value={search_query}
				oninput={() => {}}
				onkeydown={(e) => e.key === 'Enter' && doSearch()}
			/>
		</div>
		<select
			class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs"
			bind:value={category_filter}
			onchange={doSearch}
		>
			<option value="">All categories</option>
			{#each category_options as c}
				<option value={c} class="capitalize">{c}</option>
			{/each}
		</select>
		<label class="flex items-center gap-1.5 cursor-pointer select-none">
			<input type="checkbox" class="checkbox checkbox-xs checkbox-warning"
				bind:checked={low_stock_only} onchange={doSearch} />
			<span class="text-xs text-base-content/60 flex items-center gap-1">
				<TriangleAlert class="size-3 text-warning" /> Low stock only
			</span>
		</label>
		{#if data.low_stock_count > 0}
			<span class="badge badge-warning badge-sm gap-1 ml-auto">
				<TriangleAlert class="size-2.5" /> {data.low_stock_count} alerts
			</span>
		{/if}
	</div>

	<!-- Table -->
	<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden ev-fade-up ev-d2">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<table class="ev-table">
				<thead>
					<tr>
						<th>Item</th>
						<th>SKU</th>
						<th>Category</th>
						<th>Stock</th>
						<th>Unit Price</th>
						<th>Expires</th>
						<th>Location</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each display_items as item (item._id)}
						<tr class="{isLowStock(item) ? 'bg-warning/[0.04]' : ''} {isExpired(item) ? 'bg-error/[0.04]' : ''}">
							<td>
								<p class="font-semibold text-base-content">{item.name}</p>
								{#if item.description}
									<p class="text-[0.7rem] text-base-content/40 truncate max-w-44">{item.description}</p>
								{/if}
							</td>
							<td class="font-mono text-xs text-base-content/60">{item.sku}</td>
							<td>
								<span class="badge badge-xs {category_badge[item.category] ?? 'badge-ghost'} capitalize">{item.category}</span>
							</td>
							<td>
								<div class="flex items-center gap-1.5">
									<span class="font-bold tabular-nums {isLowStock(item) ? 'text-warning' : 'text-base-content'}">{item.quantity}</span>
									<span class="text-base-content/40 text-xs">{item.unit}</span>
									{#if isLowStock(item)}
										<TriangleAlert class="size-3 text-warning" />
									{/if}
								</div>
								<p class="text-[0.65rem] text-base-content/30">Reorder at {item.reorder_level}</p>
							</td>
							<td class="font-semibold text-base-content tabular-nums">{formatPHP(item.unit_price)}</td>
							<td>
								{#if item.expiration_date}
									<span class="text-xs {isExpired(item) ? 'text-error font-semibold' : isExpiringSoon(item) ? 'text-warning font-semibold' : 'text-base-content/50'}">
										{date.formatDate({ date: item.expiration_date, format: 'MMM dd, yyyy' })}
									</span>
									{#if isExpired(item)}<p class="text-[0.65rem] text-error">Expired</p>
									{:else if isExpiringSoon(item)}<p class="text-[0.65rem] text-warning">Expiring soon</p>{/if}
								{:else}
									<span class="text-base-content/30">—</span>
								{/if}
							</td>
							<td class="text-base-content/50 text-xs">{item.location || '—'}</td>
							<td>
								<div class="flex gap-1">
									<button
										class="btn btn-ghost btn-xs gap-1 text-primary"
										onclick={() => { restock_item = { id: item._id, name: item.name, current_qty: item.quantity }; show_restock_modal = true; }}
										title="Restock"
									>
										<PackagePlus class="size-3.5" />
									</button>
									<form method="POST" action="?/archive">
										<input type="hidden" name="id" value={item._id} />
										<button
											class="btn btn-ghost btn-xs text-error/60 hover:text-error"
											type="submit"
											title="Archive"
											onclick={(e) => { if (!confirm('Archive this item?')) e.preventDefault(); }}
										>
											<Archive class="size-3.5" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr><td colspan="8">
							<div class="ev-empty">
								<Package class="size-8" />
								<p class="text-sm font-medium">No inventory items</p>
							</div>
						</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<div class="ev-fade-up ev-d3"><Pagination total={data.total} /></div>
</div>

<!-- ── Add Item Modal ─────────────────────────────────────────────── -->
{#if show_add_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-xl">
			<div class="mb-5 flex items-center justify-between">
				<h3 class="text-base font-bold text-base-content">Add Inventory Item</h3>
				<button onclick={() => (show_add_modal = false)} class="btn btn-ghost btn-sm btn-circle">
					<X class="size-4" />
				</button>
			</div>

			{#if $message}
				<div class="alert {$message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4 text-sm py-2.5">
					{$message.text}
				</div>
			{/if}

			<form action="?/new" method="POST" use:sfEnhance class="grid grid-cols-2 gap-3">
				<div class="col-span-2">
					<Input.Text name="name" label="Item Name" errors={$errors.name}
						bind:value={$sf.name} constraints={$constraints.name} required={true}>
						<Message message={$errors.name} />
					</Input.Text>
				</div>
				<div>
					<Input.Text name="sku" label="SKU" errors={$errors.sku}
						bind:value={$sf.sku} constraints={$constraints.sku} required={true}>
						<Message message={$errors.sku} />
					</Input.Text>
				</div>
				<div>
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend">Category *</legend>
						<select name="category" class="select select-sm w-full" bind:value={$sf.category}>
							{#each category_options as c}
								<option value={c} class="capitalize">{c}</option>
							{/each}
						</select>
						<Message message={$errors.category} />
					</fieldset>
				</div>
				<div>
					<Input.Number name="quantity" label="Initial Quantity" errors={$errors.quantity}
						bind:value={$sf.quantity} constraints={$constraints.quantity} required={true}>
						<Message message={$errors.quantity} />
					</Input.Number>
				</div>
				<div>
					<Input.Number name="reorder_level" label="Reorder Level" errors={$errors.reorder_level}
						bind:value={$sf.reorder_level} constraints={$constraints.reorder_level} required={false}>
						<Message message={$errors.reorder_level} />
					</Input.Number>
				</div>
				<div>
					<Input.Number name="unit_price" label="Unit Price (₱)" errors={$errors.unit_price}
						bind:value={$sf.unit_price} constraints={$constraints.unit_price} required={true}>
						<Message message={$errors.unit_price} />
					</Input.Number>
				</div>
				<div>
					<Input.Text name="unit" label="Unit (tablet, ml…)" errors={$errors.unit}
						bind:value={$sf.unit} constraints={$constraints.unit} required={false}>
					</Input.Text>
				</div>
				<div class="col-span-2">
					<Input.Date name="expiration_date" label="Expiration Date" errors={$errors.expiration_date}
						bind:value={$sf.expiration_date} constraints={$constraints.expiration_date} required={false}>
						<Message message={$errors.expiration_date} />
					</Input.Date>
				</div>
				<div>
					<Input.Text name="supplier" label="Supplier" errors={$errors.supplier}
						bind:value={$sf.supplier} constraints={$constraints.supplier} required={false}>
					</Input.Text>
				</div>
				<div>
					<Input.Text name="location" label="Shelf / Location" errors={$errors.location}
						bind:value={$sf.location} constraints={$constraints.location} required={false}>
					</Input.Text>
				</div>
				<div class="col-span-2">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend">Description</legend>
						<textarea name="description" class="textarea textarea-sm w-full" rows="2"
							bind:value={$sf.description} placeholder="Optional notes..."></textarea>
					</fieldset>
				</div>
				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_add_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Add Item</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_add_modal = false)}></div>
	</div>
{/if}

<!-- ── Restock Modal ──────────────────────────────────────────────── -->
{#if show_restock_modal && restock_item}
	<div class="modal modal-open">
		<div class="modal-box max-w-sm">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-base font-bold text-base-content">Restock</h3>
				<button onclick={() => (show_restock_modal = false)} class="btn btn-ghost btn-sm btn-circle">
					<X class="size-4" />
				</button>
			</div>
			<p class="text-sm text-base-content/70 mb-1 font-semibold">{restock_item.name}</p>
			<p class="text-xs text-base-content/40 mb-4">Current stock: <strong class="text-base-content">{restock_item.current_qty}</strong></p>
			<form method="POST" action="?/restock" use:enhance={() => {
				return async ({ update }) => { await update(); show_restock_modal = false; restock_item = null; };
			}}>
				<input type="hidden" name="id" value={restock_item.id} />
				<fieldset class="fieldset mb-4">
					<legend class="fieldset-legend">Quantity to Add *</legend>
					<input type="number" name="qty" min="1" class="input input-sm w-full" placeholder="e.g. 50" required />
				</fieldset>
				<div class="modal-action">
					<button type="button" onclick={() => (show_restock_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Restock</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_restock_modal = false)}></div>
	</div>
{/if}
