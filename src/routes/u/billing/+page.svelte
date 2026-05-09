<script lang="ts">
	import { toast } from '$lib/stores/toast';
import Tooltip from '$lib/components/ui/Tooltip.svelte';
import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, ReceiptText, Plus, Trash2 } from '@lucide/svelte';
	import { SERVICE_CATALOG, formatPHP } from '$lib/constants';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_new_modal = $state(false);
	let show_pay_modal = $state(false);
	let pay_invoice: { id: string; number: string; total: number } | null = $state(null);

	// New invoice builder state
	let selected_customer_id = $state('');
	let animals_for_customer: { _id: string; name: string; species: string }[] = $state([]);
	let selected_animal_id = $state('');
	let service_items: { desc: string; price: number; qty: number }[] = $state([]);
	let inventory_items: { id: string; name: string; price: number; qty: number }[] = $state([]);
	let discount_amount = $state(0);
	let inv_search = $state('');

	async function loadAnimals() {
		if (!selected_customer_id) { animals_for_customer = []; return; }
		const res = await fetch(`/api/animals-by-customer?customer_id=${selected_customer_id}`);
		if (res.ok) animals_for_customer = await res.json();
	}

	$effect(() => { loadAnimals(); });

	function addService(item: typeof SERVICE_CATALOG[number]) {
		service_items = [...service_items, { desc: item.name, price: item.price, qty: 1 }];
	}

	function addInventory(item: typeof data.inventory[0]) {
		if (inventory_items.find((i) => i.id === item._id)) return;
		inventory_items = [...inventory_items, { id: item._id, name: item.name, price: item.unit_price, qty: 1 }];
	}

	let filtered_inv = $derived(
		data.inventory.filter((i: typeof data.inventory[0]) =>
			i.name.toLowerCase().includes(inv_search.toLowerCase()) ||
			i.sku.toLowerCase().includes(inv_search.toLowerCase())
		)
	);

	let subtotal = $derived(
		[...service_items, ...inventory_items].reduce((s, i) => s + i.price * i.qty, 0)
	);
	let grand_total = $derived(Math.max(0, subtotal - discount_amount));

	const status_badge: Record<string, string> = {
		draft: 'badge-ghost', sent: 'badge-info', paid: 'badge-success',
		overdue: 'badge-error', cancelled: 'badge-neutral'
	};

	const status_options = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
	let status_filter = $state(data.status_filter);

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};
</script>

<svelte:head><title>EasyVet - Billing</title></svelte:head>

<!-- Header -->
<div class="ev-page">
<header class="flex items-center justify-between gap-4">
	<div class="flex items-center gap-3">
		<select class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs" bind:value={status_filter}
			onchange={() => goto(`/u/billing?status=${status_filter}`)}>
			<option value="">All statuses</option>
			{#each status_options as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>

		<!-- Revenue summary chips -->
		<div class="flex items-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
			Today: {formatPHP(data.today_revenue)}
		</div>
		<div class="flex items-center gap-1.5 rounded-lg border border-warning/25 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
			Pending: {formatPHP(data.pending_total)}
		</div>
	</div>

	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs"
		onclick={() => (show_new_modal = true)}>
		<CirclePlus class="size-3.5" /> New Invoice
	</button>
</header>

<!-- Invoice Table -->
<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<table class="ev-table">
			<thead class="z-20 text-xs">
				<tr>
					<th>Invoice #</th>
					<th>Patient</th>
					<th>Owner</th>
					<th>Date</th>
					<th>Due Date</th>
					<th>Total</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.invoices as inv}
					<tr class="hover:bg-base-200 cursor-pointer" onclick={() => goto(resolve(`/u/billing/${inv._id}`))}>
						<td class="font-mono font-semibold">{inv.invoice_number}</td>
						<td>
							<div class="flex items-center gap-1.5">
								<span>{species_emoji[inv.animal_id?.species] ?? '🐾'}</span>
								<span>{inv.animal_id?.name ?? '—'}</span>
							</div>
						</td>
						<td>{inv.customer_id?.firstname ?? '—'} {inv.customer_id?.lastname ?? ''}</td>
						<td>{date.formatDate({ date: inv.createdAt, format: 'MMM dd, yyyy' })}</td>
						<td class={[new Date(inv.due_date) < new Date() && inv.status !== 'paid' ? 'text-error font-semibold' : '']}>
							{date.formatDate({ date: inv.due_date, format: 'MMM dd, yyyy' })}
						</td>
						<td class="font-bold">{formatPHP(inv.total)}</td>
						<td>
							<span class="badge badge-xs {status_badge[inv.status]} capitalize">{inv.status}</span>
						</td>
						<td onclick={(e) => e.stopPropagation()}>
							{#if inv.status !== 'paid' && inv.status !== 'cancelled'}
								<button class="btn btn-xs btn-success btn-soft"
									onclick={() => { pay_invoice = { id: inv._id, number: inv.invoice_number, total: inv.total }; show_pay_modal = true; }}>
									Mark Paid
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="8" class="py-12 text-center text-sm text-base-content/40">No invoices found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- ── New Invoice Modal ──────────────────────────────── -->
{#if show_new_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-3xl max-h-[92vh] overflow-y-auto">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2"><ReceiptText class="size-5" /> New Invoice</h3>
				<button onclick={() => (show_new_modal = false)} class="btn btn-ghost btn-xs btn-circle">
					<X class="size-4" />
				</button>
			</div>

			<form method="POST" action="?/create" use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') toast.success('Invoice created.');
				if (result.type === 'failure') toast.error('Failed to create invoice.');
				await update();
				if (result.type === 'success') show_new_modal = false;
			};
		}} class="flex flex-col gap-5">
				<!-- Patient selection -->
				<div class="grid grid-cols-2 gap-3">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Customer *</legend>
						<select name="customer_id" class="select select-sm w-full" required
							bind:value={selected_customer_id}>
							<option value="">Select customer...</option>
							{#each data.customers as c}
								<option value={c._id}>{c.firstname} {c.lastname}</option>
							{/each}
						</select>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Animal *</legend>
						<select name="animal_id" class="select select-sm w-full" required
							bind:value={selected_animal_id} disabled={!animals_for_customer.length}>
							<option value="">
								{selected_customer_id ? (animals_for_customer.length ? 'Select animal...' : 'No animals registered') : 'Select customer first'}
							</option>
							{#each animals_for_customer as a}
								<option value={a._id}>{species_emoji[a.species] ?? '🐾'} {a.name}</option>
							{/each}
						</select>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Due Date *</legend>
						<input type="date" name="due_date" class="input input-sm w-full" required
							value={date.dateToString(new Date(Date.now() + 7 * 86400000))} />
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Discount (₱)</legend>
						<input type="number" name="discount_amount" min="0" step="0.01"
							class="input input-sm w-full" bind:value={discount_amount} />
					</fieldset>
				</div>

				<!-- Service Items -->
				<div>
					<p class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Services</p>
					<div class="flex flex-wrap gap-1 mb-2">
						{#each SERVICE_CATALOG as svc}
							<button type="button" onclick={() => addService(svc)}
								class="btn btn-xs btn-outline btn-primary">{svc.name}</button>
						{/each}
					</div>

					{#if service_items.length}
						<table class="table table-xs mb-2">
							<thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead>
							<tbody>
								{#each service_items as item, i}
									<tr>
										<td>
											<input type="text" name="svc_desc[]" class="input input-xs w-full" bind:value={item.desc} />
										</td>
										<td>
											<input type="number" name="svc_qty[]" min="1" class="input input-xs w-14" bind:value={item.qty} />
										</td>
										<td>
											<input type="number" name="svc_price[]" min="0" step="0.01" class="input input-xs w-24" bind:value={item.price} />
										</td>
										<td class="font-semibold">{formatPHP(item.price * item.qty)}</td>
										<td>
											<button type="button" onclick={() => (service_items = service_items.filter((_, j) => j !== i))}
												class="btn btn-xs btn-ghost btn-circle text-error"><Trash2 class="size-3" /></button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
					<button type="button" onclick={() => addService({ id: 'custom', name: 'Custom Service', price: 0 })}
						class="btn btn-xs btn-ghost gap-1"><Plus class="size-3" /> Custom service</button>
				</div>

				<!-- Inventory Items -->
				<div>
					<p class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Inventory / Products</p>
					<input type="text" placeholder="Search inventory..." class="input input-sm w-full mb-2"
						bind:value={inv_search} />
					<div class="max-h-28 overflow-y-auto rounded-lg border border-base-200 mb-2">
						{#each filtered_inv.slice(0, 30) as item}
							<button type="button"
								class="flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-base-200 text-left"
								onclick={() => addInventory(item)}>
								<span>{item.name} <span class="text-base-content/40">({item.sku})</span></span>
								<span class="text-primary font-semibold">{formatPHP(item.unit_price)}/{item.unit}</span>
							</button>
						{/each}
					</div>
					{#if inventory_items.length}
						<table class="table table-xs">
							<thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th><th></th></tr></thead>
							<tbody>
								{#each inventory_items as item}
									<tr>
										<td>
											{item.name}
											<input type="hidden" name="inv_id[]" value={item.id} />
											<input type="hidden" name="inv_name[]" value={item.name} />
											<input type="hidden" name="inv_price[]" value={item.price} />
										</td>
										<td><input type="number" name="inv_qty[]" min="1" class="input input-xs w-14" bind:value={item.qty} /></td>
										<td>{formatPHP(item.price)}</td>
										<td class="font-semibold">{formatPHP(item.price * item.qty)}</td>
										<td>
											<button type="button" onclick={() => (inventory_items = inventory_items.filter((i) => i.id !== item.id))}
												class="btn btn-xs btn-ghost btn-circle text-error"><Trash2 class="size-3" /></button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>

				<!-- Totals -->
				<div class="rounded-xl border border-base-200 p-4 text-sm">
					<div class="flex justify-between"><span>Subtotal</span><span class="font-semibold">{formatPHP(subtotal)}</span></div>
					<div class="flex justify-between text-error"><span>Discount</span><span>- {formatPHP(discount_amount)}</span></div>
					<div class="divider my-1"></div>
					<div class="flex justify-between text-base font-bold"><span>Total</span><span>{formatPHP(grand_total)}</span></div>
				</div>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Notes</legend>
					<textarea name="notes" class="textarea textarea-sm w-full" rows="2" placeholder="Optional notes..."></textarea>
				</fieldset>

				<div class="modal-action">
					<button type="button" onclick={() => (show_new_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Create Invoice</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_new_modal = false)}></div>
	</div>
{/if}

<!-- ── Mark Paid Modal ────────────────────────────────── -->
{#if show_pay_modal && pay_invoice}
	<div class="modal modal-open">
		<div class="modal-box max-w-sm">
			<h3 class="text-lg font-bold mb-2">Mark as Paid</h3>
			<p class="text-sm mb-1">Invoice: <strong>{pay_invoice.number}</strong></p>
			<p class="text-sm mb-4">Amount: <strong>{formatPHP(pay_invoice.total)}</strong></p>
			<form method="POST" action="?/mark_paid" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Payment recorded. Invoice marked as paid.');
					if (result.type === 'failure') toast.error('Failed to record payment.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_pay_modal = false; pay_invoice = null; }
				};
			}}>
				<input type="hidden" name="id" value={pay_invoice.id} />
				<fieldset class="fieldset mb-4">
					<legend class="fieldset-legend">Payment Method *</legend>
					<select name="payment_method" class="select select-sm w-full" required>
						<option value="cash">Cash</option>
						<option value="gcash">GCash</option>
						<option value="card">Card</option>
						<option value="bank_transfer">Bank Transfer</option>
					</select>
				</fieldset>
				<div class="modal-action">
					<button type="button" onclick={() => (show_pay_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-success btn-sm">Confirm Payment</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_pay_modal = false)}></div>
	</div>
{/if}
