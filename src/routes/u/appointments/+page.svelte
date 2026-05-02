<script lang="ts">
	import { toast } from '$lib/stores/toast';
import Tooltip from '$lib/components/ui/Tooltip.svelte';
import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, Calendar } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let selected_customer_id = $state('');
	let filtered_animals = $derived(
		data.animals.filter((a: typeof data.animals[0]) =>
			!selected_customer_id || a.customer_id === selected_customer_id
		)
	);

	let status_filter = $state(data.status_filter);
	let date_filter = $state(data.date_filter);

	function doFilter() {
		const params = new URLSearchParams();
		if (status_filter) params.set('status', status_filter);
		if (date_filter) params.set('date', date_filter);
		params.set('page', '1');
		goto(`/u/appointments?${params}`);
	}

	const appointment_types = ['checkup', 'vaccination', 'surgery', 'emergency', 'dental', 'follow-up', 'grooming', 'laboratory'];
	const statuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

	const status_badge: Record<string, string> = {
		scheduled: 'badge-info', confirmed: 'badge-primary', 'in-progress': 'badge-warning',
		completed: 'badge-success', cancelled: 'badge-neutral', 'no-show': 'badge-error'
	};

	const type_badge: Record<string, string> = {
		checkup: 'badge-info', vaccination: 'badge-success', surgery: 'badge-error',
		emergency: 'badge-error', dental: 'badge-warning', 'follow-up': 'badge-ghost',
		grooming: 'badge-secondary', laboratory: 'badge-primary'
	};

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};
</script>

<svelte:head><title>EasyVet - Appointments</title></svelte:head>

<div class="ev-page">
<header class="flex items-center justify-between gap-4">
	<div class="flex gap-2 items-center">
		<input type="date" class="input input-sm input-ghost bg-base-200"
			bind:value={date_filter} onchange={doFilter} />
		<select class="select select-sm select-ghost bg-base-200" bind:value={status_filter} onchange={doFilter}>
			<option value="">All statuses</option>
			{#each statuses as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
		{#if status_filter || date_filter}
			<a href="/u/appointments" class="btn btn-sm btn-ghost text-xs opacity-60">Clear</a>
		{/if}
	</div>
	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs" onclick={() => (show_modal = true)}>
		<CirclePlus class="size-3.5" /> New Appointment
	</button>
</header>

<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<table class="ev-table">
			<thead class="z-20 text-xs">
				<tr>
					<th>Patient</th>
					<th>Owner</th>
					<th>Date & Time</th>
					<th>Type</th>
					<th>Veterinarian</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.appointments as appt}
					<tr class="hover:bg-base-200">
						<td>
							<div class="flex items-center gap-2">
								<span>{species_emoji[appt.animal_id?.species] ?? '🐾'}</span>
								<span class="font-semibold">{appt.animal_id?.name ?? '—'}</span>
							</div>
						</td>
						<td>
							<p>{appt.customer_id?.firstname} {appt.customer_id?.lastname}</p>
							<p class="text-base-content/40">{appt.customer_id?.contact_number ?? ''}</p>
						</td>
						<td>
							<p class="font-semibold">{date.formatDate({ date: appt.scheduled_at, format: 'MMM dd, yyyy' })}</p>
							<p class="text-base-content/50">{date.formatDate({ date: appt.scheduled_at, format: 'hh:mm aa' })}</p>
						</td>
						<td>
							<span class="badge badge-xs {type_badge[appt.type] ?? 'badge-ghost'} capitalize">{appt.type}</span>
						</td>
						<td>Dr. {appt.veterinarian}</td>
						<td>
							<span class="badge badge-xs {status_badge[appt.status]} capitalize">{appt.status}</span>
						</td>
						<td>
							<form method="POST" action="?/update_status" use:enhance>
								<input type="hidden" name="id" value={appt._id} />
								<select name="status" class="select select-xs"
									onchange={(e) => { e.currentTarget.form?.requestSubmit(); }}>
									{#each statuses as s}
										<option value={s} selected={appt.status === s} class="capitalize">{s}</option>
									{/each}
								</select>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="py-12 text-center text-sm text-base-content/40">
							No appointments found.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- New Appointment Modal -->
{#if show_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-md">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<Calendar class="size-5" /> New Appointment
				</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-ghost btn-xs btn-circle">
					<X class="size-4" />
				</button>
			</div>
			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Appointment scheduled.');
					if (result.type === 'failure') toast.error('Failed to schedule appointment.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_modal = false; }
				};
			}} class="flex flex-col gap-3">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Owner (Customer) *</legend>
					<select name="customer_id" class="select select-sm w-full" required bind:value={selected_customer_id}>
						<option value="">Select customer...</option>
						{#each data.customers as c}
							<option value={c._id}>{c.firstname} {c.lastname}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Animal *</legend>
					<select name="animal_id" class="select select-sm w-full" required
						disabled={!selected_customer_id}>
						<option value="">
							{selected_customer_id ? 'Select animal...' : 'Select customer first'}
						</option>
						{#each filtered_animals as a}
							<option value={a._id}>{species_emoji[a.species] ?? '🐾'} {a.name}</option>
						{/each}
					</select>
				</fieldset>

				<div class="grid grid-cols-2 gap-3">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Date & Time *</legend>
						<input type="datetime-local" name="scheduled_at" class="input input-sm w-full" required />
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Duration (min)</legend>
						<input type="number" name="duration_minutes" class="input input-sm w-full" value="30" min="5" />
					</fieldset>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Type *</legend>
						<select name="type" class="select select-sm w-full" required>
							{#each appointment_types as t}
								<option value={t} class="capitalize">{t}</option>
							{/each}
						</select>
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Veterinarian *</legend>
						<input type="text" name="veterinarian" class="input input-sm w-full" placeholder="Dr. Name" required />
					</fieldset>
				</div>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Notes</legend>
					<textarea name="notes" class="textarea textarea-sm w-full" rows="2" placeholder="Optional..."></textarea>
				</fieldset>

				<div class="modal-action">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Schedule</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}
