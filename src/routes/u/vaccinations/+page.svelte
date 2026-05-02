<script lang="ts">
	import { toast } from '$lib/stores/toast';
import Tooltip from '$lib/components/ui/Tooltip.svelte';
import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, Syringe, TriangleAlert } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let show_admin_modal = $state(false);
	let admin_target: { id: string; name: string } | null = $state(null);
	let selected_customer_id = $state('');
	let status_filter = $state(data.status_filter);

	const vaccination_types = ['rabies','dhpp','bordetella','leptospirosis','fvrcp','felv','microchip','deworming','flea-tick-treatment','other'];
	const statuses = ['scheduled', 'administered', 'missed', 'cancelled'];

	const status_badge: Record<string, string> = {
		scheduled: 'badge-info', administered: 'badge-success',
		missed: 'badge-error', cancelled: 'badge-neutral'
	};

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};

	function formatPHP(n: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0);
	}

	function isDueOrOverdue(v: typeof data.vaccinations[0]) {
		if (!v.next_due_date || v.status !== 'administered') return false;
		return new Date(v.next_due_date) <= new Date(Date.now() + 30 * 86400000);
	}

	function isOverdue(v: typeof data.vaccinations[0]) {
		if (!v.next_due_date) return false;
		return new Date(v.next_due_date) < new Date();
	}

	let filtered_animals = $derived(
		data.animals.filter((a: typeof data.animals[0]) =>
			!selected_customer_id || a.customer_id === selected_customer_id
		)
	);
</script>

<svelte:head><title>EasyVet - Vaccinations</title></svelte:head>

<div class="ev-page">
<header class="flex items-center justify-between gap-4">
	<div class="flex gap-2 items-center">
		{#if data.upcoming_due_count > 0}
			<div class="badge badge-warning gap-1">
				<TriangleAlert class="size-3" /> {data.upcoming_due_count} boosters due soon
			</div>
		{/if}
		<select class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs" bind:value={status_filter}
			onchange={() => goto(`/u/vaccinations?status=${status_filter}`)}>
			<option value="">All statuses</option>
			{#each statuses as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
	</div>
	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs" onclick={() => (show_modal = true)}>
		<CirclePlus class="size-3.5" /> Record Vaccination
	</button>
</header>

<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<table class="ev-table">
			<thead class="z-20 text-xs">
				<tr>
					<th>Patient</th>
					<th>Owner</th>
					<th>Vaccine</th>
					<th>Type</th>
					<th>Dose</th>
					<th>Scheduled</th>
					<th>Next Due</th>
					<th>Fee</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.vaccinations as v}
					<tr class={['hover:bg-base-200', isDueOrOverdue(v) && 'bg-warning/5']}>
						<td>
							<div class="flex items-center gap-1.5">
								<span>{species_emoji[v.animal_id?.species] ?? '🐾'}</span>
								<p class="font-semibold">{v.animal_id?.name ?? '—'}</p>
							</div>
						</td>
						<td>{v.customer_id?.firstname} {v.customer_id?.lastname}</td>
						<td>
							<p class="font-semibold">{v.vaccine_name}</p>
							{#if v.vaccine_brand}<p class="text-base-content/40">{v.vaccine_brand}</p>{/if}
						</td>
						<td class="capitalize">{v.type}</td>
						<td>Dose {v.dose_number}</td>
						<td>{date.formatDate({ date: v.scheduled_date, format: 'MMM dd, yyyy' })}</td>
						<td>
							{#if v.next_due_date}
								<span class={[isOverdue(v) ? 'text-error font-semibold' : isDueOrOverdue(v) ? 'text-warning font-semibold' : '']}>
									{date.formatDate({ date: v.next_due_date, format: 'MMM dd, yyyy' })}
								</span>
								{#if isOverdue(v)}<p class="text-error text-xs">Overdue</p>
								{:else if isDueOrOverdue(v)}<p class="text-warning text-xs">Due soon</p>{/if}
							{:else}
								<span class="text-base-content/30">—</span>
							{/if}
						</td>
						<td>{formatPHP(v.service_fee)}</td>
						<td>
							<span class="badge badge-xs {status_badge[v.status]} capitalize">{v.status}</span>
						</td>
						<td>
							{#if v.status === 'scheduled'}
								<button class="btn btn-xs btn-success btn-soft"
									onclick={() => { admin_target = { id: v._id, name: v.vaccine_name }; show_admin_modal = true; }}>
									Administer
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="10" class="py-12 text-center text-sm text-base-content/40">No vaccination records found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- New Vaccination Modal -->
{#if show_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-lg">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<Syringe class="size-5" /> Record Vaccination
				</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-ghost btn-xs btn-circle"><X class="size-4" /></button>
			</div>

			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Vaccination record saved.');
					if (result.type === 'failure') toast.error('Failed to save vaccination.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_modal = false; }
				};
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
							<option value={a._id}>{a.name}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Vaccine Type *</legend>
					<select name="type" class="select select-sm w-full" required>
						{#each vaccination_types as t}
							<option value={t} class="capitalize">{t.toUpperCase()}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Vaccine Name *</legend>
					<input type="text" name="vaccine_name" class="input input-sm w-full" placeholder="e.g. Nobivac Puppy DP" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Brand</legend>
					<input type="text" name="vaccine_brand" class="input input-sm w-full" placeholder="e.g. MSD Animal Health" />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Dose #</legend>
					<input type="number" name="dose_number" class="input input-sm w-full" value="1" min="1" />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Scheduled Date *</legend>
					<input type="date" name="scheduled_date" class="input input-sm w-full" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Next Due Date</legend>
					<input type="date" name="next_due_date" class="input input-sm w-full" />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Administered By</legend>
					<input type="text" name="administered_by" class="input input-sm w-full" placeholder="Leave blank if scheduled" />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Service Fee (₱)</legend>
					<input type="number" name="service_fee" min="0" step="0.01" class="input input-sm w-full" placeholder="500.00" />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Notes</legend>
					<textarea name="notes" class="textarea textarea-sm w-full" rows="2" placeholder="Reaction, observations..."></textarea>
				</fieldset>

				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Save</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}

<!-- Administer Modal -->
{#if show_admin_modal && admin_target}
	<div class="modal modal-open">
		<div class="modal-box max-w-sm">
			<h3 class="text-lg font-bold mb-3">Administer Vaccine</h3>
			<p class="text-sm text-base-content/60 mb-3">Vaccine: <strong>{admin_target.name}</strong></p>
			<form method="POST" action="?/mark_administered" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Vaccine administered.');
					if (result.type === 'failure') toast.error('Failed to record administration.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_admin_modal = false; admin_target = null; }
				};
			}}>
				<input type="hidden" name="id" value={admin_target.id} />
				<fieldset class="fieldset mb-4">
					<legend class="fieldset-legend">Administered By</legend>
					<input type="text" name="administered_by" class="input input-sm w-full" placeholder="Veterinarian name" />
				</fieldset>
				<div class="modal-action">
					<button type="button" onclick={() => { show_admin_modal = false; admin_target = null; }} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-success btn-sm">Confirm</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => { show_admin_modal = false; admin_target = null; }}></div>
	</div>
{/if}
