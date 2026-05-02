<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import { ArrowLeft, Printer, CheckCircle } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { invoice } = data;
	const customer = invoice.customer_id;
	const animal = invoice.animal_id;

	function formatPHP(n: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0);
	}

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};

	const status_badge: Record<string, string> = {
		draft: 'badge-ghost', sent: 'badge-info', paid: 'badge-success',
		overdue: 'badge-error', cancelled: 'badge-neutral'
	};

	let show_pay = $state(false);
</script>

<svelte:head><title>EasyVet - Invoice {invoice.invoice_number}</title></svelte:head>

<div class="flex h-full flex-col gap-4 max-w-3xl">
	<!-- Toolbar -->
	<div class="flex items-center justify-between print:hidden">
		<a href={resolve('/u/billing')} class="btn btn-ghost btn-sm gap-1">
			<ArrowLeft class="size-4" /> Billing
		</a>
		<div class="flex gap-2">
			<button class="btn btn-sm btn-ghost gap-1" onclick={() => window.print()}>
				<Printer class="size-4" /> Print
			</button>
			{#if invoice.status !== 'paid' && invoice.status !== 'cancelled'}
				<button class="btn btn-sm btn-success gap-1" onclick={() => (show_pay = true)}>
					<CheckCircle class="size-4" /> Mark as Paid
				</button>
				<form method="POST" action="?/cancel" use:enhance>
					<button class="btn btn-sm btn-error btn-outline" type="submit"
						onclick={(e) => { if (!confirm('Cancel this invoice?')) e.preventDefault(); }}>
						Cancel
					</button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Invoice Card -->
	<div class="card bg-base-100 p-8 shadow-sm" id="invoice-print">
		<!-- Header -->
		<div class="flex items-start justify-between mb-8">
			<div>
				<h1 class="text-2xl font-bold text-primary">EasyVet</h1>
				<p class="text-xs text-base-content/50 mt-0.5">Veterinary Management System</p>
			</div>
			<div class="text-right">
				<p class="text-2xl font-bold font-mono">{invoice.invoice_number}</p>
				<span class="badge {status_badge[invoice.status]} capitalize">{invoice.status}</span>
			</div>
		</div>

		<!-- Bill To / Patient -->
		<div class="grid grid-cols-2 gap-8 mb-8">
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">Bill To</p>
				<p class="font-bold">{customer?.firstname} {customer?.lastname}</p>
				{#if customer?.contact_number}<p class="text-sm text-base-content/60">{customer.contact_number}</p>{/if}
				{#if customer?.email}<p class="text-sm text-base-content/60">{customer.email}</p>{/if}
				{#if customer?.address_city}
					<p class="text-sm text-base-content/60">{customer.address_city}, {customer.address_province}</p>
				{/if}
			</div>
			<div>
				<p class="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">Patient</p>
				<p class="font-bold">
					{species_emoji[animal?.species] ?? '🐾'} {animal?.name}
				</p>
				<p class="text-sm text-base-content/60 capitalize">{animal?.species} · {animal?.breed}</p>
			</div>
		</div>

		<!-- Dates -->
		<div class="grid grid-cols-3 gap-4 mb-8 text-sm">
			<div>
				<p class="text-xs text-base-content/40 uppercase tracking-wider">Invoice Date</p>
				<p class="font-semibold">{date.formatDate({ date: invoice.createdAt, format: 'MMMM dd, yyyy' })}</p>
			</div>
			<div>
				<p class="text-xs text-base-content/40 uppercase tracking-wider">Due Date</p>
				<p class="font-semibold {new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-error' : ''}">
					{date.formatDate({ date: invoice.due_date, format: 'MMMM dd, yyyy' })}
				</p>
			</div>
			{#if invoice.paid_at}
				<div>
					<p class="text-xs text-base-content/40 uppercase tracking-wider">Paid On</p>
					<p class="font-semibold text-success">{date.formatDate({ date: invoice.paid_at, format: 'MMMM dd, yyyy' })}</p>
				</div>
			{/if}
		</div>

		<!-- Line Items -->
		<table class="table table-sm mb-6">
			<thead class="border-b-2 border-base-300">
				<tr class="text-xs uppercase tracking-wider text-base-content/50">
					<th class="text-left">Description</th>
					<th class="text-right">Type</th>
					<th class="text-right">Qty</th>
					<th class="text-right">Unit Price</th>
					<th class="text-right">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each invoice.items as item}
					<tr class="border-b border-base-200">
						<td class="py-3">{item.description}</td>
						<td class="text-right">
							<span class="badge badge-xs capitalize {item.type === 'service' ? 'badge-primary' : 'badge-secondary'}">
								{item.type}
							</span>
						</td>
						<td class="text-right">{item.quantity}</td>
						<td class="text-right">{formatPHP(item.unit_price)}</td>
						<td class="text-right font-semibold">{formatPHP(item.total)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Totals -->
		<div class="flex justify-end">
			<div class="w-64 space-y-1.5 text-sm">
				<div class="flex justify-between">
					<span class="text-base-content/60">Subtotal</span>
					<span>{formatPHP(invoice.subtotal)}</span>
				</div>
				{#if invoice.discount_amount > 0}
					<div class="flex justify-between text-error">
						<span>Discount</span>
						<span>- {formatPHP(invoice.discount_amount)}</span>
					</div>
				{/if}
				{#if invoice.tax_amount > 0}
					<div class="flex justify-between">
						<span class="text-base-content/60">Tax</span>
						<span>{formatPHP(invoice.tax_amount)}</span>
					</div>
				{/if}
				<div class="flex justify-between border-t-2 border-base-300 pt-2 text-lg font-bold">
					<span>Total</span>
					<span>{formatPHP(invoice.total)}</span>
				</div>
				{#if invoice.payment_method}
					<div class="flex justify-between text-xs text-base-content/50">
						<span>Payment via</span>
						<span class="capitalize">{invoice.payment_method.replace('_', ' ')}</span>
					</div>
				{/if}
			</div>
		</div>

		{#if invoice.notes}
			<div class="mt-6 border-t border-base-200 pt-4">
				<p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Notes</p>
				<p class="text-sm text-base-content/70">{invoice.notes}</p>
			</div>
		{/if}
	</div>
</div>

<!-- Mark Paid Modal -->
{#if show_pay}
	<div class="modal modal-open">
		<div class="modal-box max-w-sm">
			<h3 class="text-lg font-bold mb-4">Confirm Payment</h3>
			<p class="text-sm mb-1">Invoice: <strong>{invoice.invoice_number}</strong></p>
			<p class="text-sm mb-4">Amount: <strong>{formatPHP(invoice.total)}</strong></p>
			<form method="POST" action="?/mark_paid" use:enhance={() => {
				return async ({ update }) => { await update(); show_pay = false; };
			}}>
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
					<button type="button" onclick={() => (show_pay = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-success btn-sm">Confirm Payment</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_pay = false)}></div>
	</div>
{/if}

<style>
	@media print {
		:global(aside), :global(header) { display: none !important; }
		#invoice-print { box-shadow: none; border: none; }
	}
</style>
