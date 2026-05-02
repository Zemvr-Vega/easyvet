<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, ClipboardPenLine, CheckCircle, Clock, CalendarCheck } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let selected_customer_id = $state('');
	let status_filter = $state(data.status_filter);

	const consultation_types = ['general', 'specialist', 'follow-up', 'emergency', 'second-opinion'];
	const statuses = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];

	const status_badge: Record<string, string> = {
		scheduled: 'badge-info', 'in-progress': 'badge-warning',
		completed: 'badge-success', cancelled: 'badge-neutral', 'no-show': 'badge-error'
	};

	const type_badge: Record<string, string> = {
		general: 'badge-primary', specialist: 'badge-secondary', 'follow-up': 'badge-ghost',
		emergency: 'badge-error', 'second-opinion': 'badge-info'
	};

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};

	function formatPHP(n: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0);
	}

	let filtered_animals = $derived(
		data.animals.filter((a: typeof data.animals[0]) =>
			!selected_customer_id || a.customer_id === selected_customer_id
		)
	);
</script>

<svelte:head><title>EasyVet - Consultations</title></svelte:head>

<!-- Stats row -->
<div class="grid grid-cols-3 gap-3 ev-fade-up">
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-info/10 p-2"><CalendarCheck class="size-5 text-info" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Today</p>
			<p class="text-xl font-bold">{data.stats.total_today}</p>
		</div>
	</div>
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-warning/10 p-2"><Clock class="size-5 text-warning" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Pending</p>
			<p class="text-xl font-bold">{data.stats.total_pending}</p>
		</div>
	</div>
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-success/10 p-2"><CheckCircle class="size-5 text-success" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Completed</p>
			<p class="text-xl font-bold">{data.stats.total_completed}</p>
		</div>
	</div>
</div>

<div class="ev-page">
<header class="flex items-center justify-between gap-4">
	<div class="flex gap-2 items-center">
		<select class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs" bind:value={status_filter}
			onchange={() => goto(`/u/consultations?status=${status_filter}`)}>
			<option value="">All statuses</option>
			{#each statuses as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
		{#if status_filter}
			<a href="/u/consultations" class="btn btn-sm btn-ghost text-xs opacity-60">Clear</a>
		{/if}
	</div>
	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs" onclick={() => (show_modal = true)}>
		<CirclePlus class="size-3.5" /> New Consultation
	</button>
</header>

<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<table class="ev-table">
			<thead class="z-20 text-xs">
				<tr>
					<th>Patient</th>
					<th>Owner</th>
					<th>Type</th>
					<th>Scheduled</th>
					<th>Veterinarian</th>
					<th>Complaint</th>
					<th>Fee</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.consultations as c}
					<tr class="hover:bg-base-200">
						<td>
							<div class="flex items-center gap-1.5">
								<span>{species_emoji[c.animal_id?.species] ?? '🐾'}</span>
								<div>
									<p class="font-semibold">{c.animal_id?.name ?? '—'}</p>
									<p class="text-base-content/40 capitalize">{c.animal_id?.breed ?? ''}</p>
								</div>
							</div>
						</td>
						<td>
							<p>{c.customer_id?.firstname} {c.customer_id?.lastname}</p>
							<p class="text-base-content/40">{c.customer_id?.contact_number ?? ''}</p>
						</td>
						<td>
							<span class="badge badge-xs {type_badge[c.type] ?? 'badge-ghost'} capitalize">{c.type}</span>
						</td>
						<td>
							<p class="font-semibold">{date.formatDate({ date: c.scheduled_at, format: 'MMM dd, yyyy' })}</p>
							<p class="text-base-content/40">{date.formatDate({ date: c.scheduled_at, format: 'hh:mm aa' })}</p>
						</td>
						<td>Dr. {c.veterinarian}</td>
						<td class="max-w-40 truncate">{c.chief_complaint}</td>
						<td>{formatPHP(c.service_fee)}</td>
						<td>
							<span class="badge badge-xs {status_badge[c.status]} capitalize">{c.status}</span>
						</td>
						<td>
							<form method="POST" action="?/update_status" use:enhance>
								<input type="hidden" name="id" value={c._id} />
								<select name="status" class="select select-xs"
									onchange={(e) => e.currentTarget.form?.requestSubmit()}>
									{#each statuses as s}
										<option value={s} selected={c.status === s} class="capitalize">{s}</option>
									{/each}
								</select>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="9" class="py-12 text-center text-sm text-base-content/40">No consultations found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- New Consultation Modal -->
{#if show_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-lg">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<ClipboardPenLine class="size-5" /> New Consultation
				</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-ghost btn-xs btn-circle">
					<X class="size-4" />
				</button>
			</div>

			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ update }) => { await update(); show_modal = false; };
			}} class="grid grid-cols-2 gap-3 ev-fade-up">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Owner *</legend>
					<select name="customer_id" class="select select-sm w-full" required bind:value={selected_customer_id}>
						<option value="">Select customer...</option>
						{#each data.customers as c}
							<option value={c._id}>{c.firstname} {c.lastname}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Animal *</legend>
					<select name="animal_id" class="select select-sm w-full" required disabled={!selected_customer_id}>
						<option value="">{selected_customer_id ? 'Select animal...' : 'Select owner first'}</option>
						{#each filtered_animals as a}
							<option value={a._id}>{species_emoji[a.species] ?? '🐾'} {a.name}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Type</legend>
					<select name="type" class="select select-sm w-full">
						{#each consultation_types as t}
							<option value={t} class="capitalize">{t}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Date & Time *</legend>
					<input type="datetime-local" name="scheduled_at" class="input input-sm w-full" required />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Veterinarian *</legend>
					<input type="text" name="veterinarian" class="input input-sm w-full" placeholder="Dr. Name" required />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Chief Complaint *</legend>
					<input type="text" name="chief_complaint" class="input input-sm w-full" placeholder="Reason for visit" required />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">History / Notes</legend>
					<textarea name="history" class="textarea textarea-sm w-full" rows="2" placeholder="Medical history, owner observations..."></textarea>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Service Fee (₱)</legend>
					<input type="number" name="service_fee" min="0" step="0.01" class="input input-sm w-full" placeholder="350.00" />
				</fieldset>

				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Create</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}
