<script lang="ts">
	import {
		Building2,
		Cake,
		CalendarClock,
		Mail,
		MapPin,
		MapPinned,
		Mars,
		PawPrint,
		Phone,
		ShoppingBag,
		Venus,
		CircleHelp,
		CirclePlus,
		ReceiptText,
		ArrowLeft,
		Pencil
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { customer, animals, recent_invoices, upcoming_appointments, total_billed, total_paid } =
		data;

	function formatPHP(amount: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
	}

	const species_emoji: Record<string, string> = {
		dog: '🐕',
		cat: '🐈',
		bird: '🦜',
		rabbit: '🐇',
		reptile: '🦎',
		fish: '🐟',
		other: '🐾'
	};

	const vaccination_badge: Record<string, string> = {
		'up-to-date': 'badge-success',
		overdue: 'badge-error',
		unknown: 'badge-ghost'
	};

	const invoice_status_badge: Record<string, string> = {
		draft: 'badge-ghost',
		sent: 'badge-info',
		paid: 'badge-success',
		overdue: 'badge-error',
		cancelled: 'badge-neutral'
	};
</script>

<div class="flex h-full w-full flex-row gap-4 p-4">
	<!-- Left Sidebar: Customer Info -->
	<section class="ev-panel flex h-full w-72 min-w-64 flex-col gap-4 bg-base-100 p-6">
		<div class="flex items-center justify-between">
			<a href={resolve('/u/customers')} class="btn gap-1 btn-ghost btn-xs">
				<ArrowLeft class="size-3" /> Back
			</a>
			<a href={resolve(`/u/customers/${customer._id}/edit`)} class="btn gap-1 btn-ghost btn-xs">
				<Pencil class="size-3" /> Edit
			</a>
		</div>

		<div class="flex flex-row items-start gap-4">
			<div class="avatar size-16 rounded bg-secondary/20">
				<div
					class="flex w-full items-center justify-center py-6 text-3xl font-bold text-secondary-content"
				>
					{customer.firstname[0]}{customer.lastname[0]}
				</div>
			</div>

			<div class="min-w-0 grow overflow-hidden">
				<span class="block w-full max-w-full truncate text-lg font-bold">
					{customer.firstname}{customer.middlename ? ' ' + customer.middlename[0] + '.' : ''}
					{customer.lastname}aaaaaaaaaaaa
				</span>
				<p class="text-[.65rem] text-base-content/50">
					<span class="hidden md:inline">Customer since</span>
					<span>{date.formatDate({ date: customer.createdAt, format: 'MMM yyyy' })}</span>
				</p>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<div class="rounded-lg bg-base-200 p-3 text-center">
				<p class="text-xs text-base-content/50">Billed</p>
				<p class="text-sm font-bold">{formatPHP(total_billed)}</p>
			</div>
			<div class="rounded-lg bg-success/10 p-3 text-center">
				<p class="text-xs text-base-content/50">Paid</p>
				<p class="text-sm font-bold text-success">{formatPHP(total_paid)}</p>
			</div>
		</div>

		<div class="divider-thin divider my-0"></div>

		<div class="relative min-h-0 w-full grow overflow-y-auto">
			<table class="w-full max-w-full border-separate border-spacing-y-3">
				<thead>
					<tr
						><th colspan="2" class="text-left text-xs tracking-wider text-base-content/40 uppercase"
							>Contact</th
						></tr
					>
				</thead>
				<tbody>
					<tr class="text-sm">
						<td class="pr-2"><Phone class="size-4 text-base-content/30" /></td>
						<td class="text-xs leading-4">{customer.contact_number || '—'}</td>
					</tr>
					<tr class="text-sm">
						<td class="pr-2"><Mail class="size-4 text-base-content/30" /></td>
						<td class="text-xs leading-4 break-all">{customer.email || '—'}</td>
					</tr>
				</tbody>
				<thead>
					<tr
						><th
							colspan="2"
							class="pt-2 text-left text-xs tracking-wider text-base-content/40 uppercase"
							>Address</th
						></tr
					>
				</thead>
				<tbody>
					{#if customer.address_line}
						<tr class="text-sm">
							<td class="pr-2"><MapPin class="size-4 text-base-content/30" /></td>
							<td class="text-xs leading-4">
								{customer.address_house_number
									? `#${customer.address_house_number} `
									: ''}{customer.address_line}
							</td>
						</tr>
					{/if}
					{#if customer.address_barangay}
						<tr class="text-sm">
							<td class="pr-2"><MapPinned class="size-4 text-base-content/30" /></td>
							<td class="text-xs leading-4">{customer.address_barangay}</td>
						</tr>
					{/if}
					<tr class="text-sm">
						<td class="pr-2"><Building2 class="size-4 text-base-content/30" /></td>
						<td class="text-xs leading-4">
							{[customer.address_city, customer.address_province].filter(Boolean).join(', ') || '—'}
						</td>
					</tr>
				</tbody>
				<thead>
					<tr
						><th
							colspan="2"
							class="pt-2 text-left text-xs tracking-wider text-base-content/40 uppercase"
							>Personal</th
						></tr
					>
				</thead>
				<tbody>
					<tr class="text-sm">
						<td class="pr-2">
							{#if customer.sex === 1}
								<Mars class="size-4 text-base-content/30" />
							{:else if customer.sex === 2}
								<Venus class="size-4 text-base-content/30" />
							{:else}
								<CircleHelp class="size-4 text-base-content/30" />
							{/if}
						</td>
						<td class="text-xs leading-4">
							{customer.sex === 1 ? 'Male' : customer.sex === 2 ? 'Female' : 'Not indicated'}
						</td>
					</tr>
					{#if customer.birthdate}
						<tr class="text-sm">
							<td class="pr-2"><Cake class="size-4 text-base-content/30" /></td>
							<td class="text-xs leading-4">
								{date.formatDate({ date: customer.birthdate, format: 'MMMM dd, yyyy' })}
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</section>

	<!-- Right: Tabs -->
	<section class="tabs-lift tabs min-w-0 grow">
		<!-- Appointments Tab -->
		<label
			class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
		>
			<input type="radio" name="tab_customer" checked />
			<CalendarClock class="me-2 size-4" /> Appointments
		</label>
		<div class="tab-content rounded-ss-none border-transparent bg-base-100 p-4">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-xs font-semibold tracking-wider text-base-content/50 uppercase">Upcoming</p>
				<a href={resolve('/u/appointments')} class="btn gap-1 btn-soft btn-xs btn-primary">
					<CirclePlus class="size-3" /> New
				</a>
			</div>
			<ul class="list">
				{#each upcoming_appointments as appt}
					<li class="list-row items-center">
						<div class="avatar rounded bg-primary/10">
							<div class="flex size-10 items-center justify-center text-xl">
								{species_emoji[appt.animal_id?.species] ?? '🐾'}
							</div>
						</div>
						<div class="flex-1">
							<h1 class="text-sm font-semibold">{appt.animal_id?.name ?? '—'}</h1>
							<p class="text-xs text-base-content/50 capitalize">
								{appt.type} · Dr. {appt.veterinarian}
							</p>
						</div>
						<div class="text-right text-xs">
							<p class="font-semibold">
								{date.formatDate({ date: appt.scheduled_at, format: 'MMM dd, yyyy' })}
							</p>
							<p class="text-base-content/50">
								{date.formatDate({ date: appt.scheduled_at, format: 'hh:mm aa' })}
							</p>
						</div>
					</li>
				{:else}
					<li class="flex h-32 w-full items-center justify-center">
						<span class="text-sm text-base-content/40">No upcoming appointments</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Pets Tab -->
		<label
			class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
		>
			<input type="radio" name="tab_customer" />
			<PawPrint class="me-2 size-4" /> Pets ({animals.length})
		</label>
		<div class="tab-content border-transparent bg-base-100 p-4">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-xs font-semibold tracking-wider text-base-content/50 uppercase">
					Registered Animals
				</p>
				<a
					href={resolve(`/u/animals/new?customer_id=${customer._id}`)}
					class="btn gap-1 btn-soft btn-xs btn-primary"
				>
					<CirclePlus class="size-3" /> Register Pet
				</a>
			</div>
			<ul class="list">
				{#each animals as animal}
					<li class="list-row items-center rounded-lg hover:bg-base-200">
						<div class="avatar rounded bg-secondary/10">
							<div class="flex size-10 items-center justify-center text-xl">
								{species_emoji[animal.species] ?? '🐾'}
							</div>
						</div>
						<div class="flex-1">
							<h1 class="text-sm font-semibold">{animal.name}</h1>
							<p class="text-xs text-base-content/50 capitalize">
								{animal.species} · {animal.breed}{animal.is_neutered ? ' · Neutered' : ''}
							</p>
						</div>
						<div class="flex items-center gap-2">
							<span
								class="badge badge-xs {vaccination_badge[animal.vaccination_status]} capitalize"
							>
								{animal.vaccination_status.replace('-', ' ')}
							</span>
							<a href={resolve(`/u/animals/${animal._id}`)} class="btn btn-ghost btn-xs">View →</a>
						</div>
					</li>
				{:else}
					<li class="flex h-32 w-full items-center justify-center">
						<span class="text-sm text-base-content/40">No pets registered yet</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Invoices Tab -->
		<label
			class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
		>
			<input type="radio" name="tab_customer" />
			<ShoppingBag class="me-2 size-4" /> Invoices
		</label>
		<div class="tab-content border-transparent bg-base-100 p-4">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-xs font-semibold tracking-wider text-base-content/50 uppercase">
					Recent Invoices
				</p>
				<a
					href={resolve(`/u/billing/new?customer_id=${customer._id}`)}
					class="btn gap-1 btn-soft btn-xs btn-primary"
				>
					<ReceiptText class="size-3" /> New Invoice
				</a>
			</div>
			<table class="table table-sm">
				<thead class="text-xs">
					<tr><th>Invoice #</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
				</thead>
				<tbody class="text-xs">
					{#each recent_invoices as inv}
						<tr class="hover:bg-base-200">
							<td class="font-mono font-semibold">{inv.invoice_number}</td>
							<td>{date.formatDate({ date: inv.createdAt, format: 'MMM dd, yyyy' })}</td>
							<td class="font-semibold">{formatPHP(inv.total)}</td>
							<td>
								<span class="badge badge-xs {invoice_status_badge[inv.status]} capitalize"
									>{inv.status}</span
								>
							</td>
							<td>
								<a href={resolve(`/u/billing/${inv._id}`)} class="btn btn-ghost btn-xs">View</a>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="py-8 text-center text-base-content/40">No invoices yet</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
