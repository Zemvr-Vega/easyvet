<script lang="ts">
	import { toast } from '$lib/stores/toast';
import Tooltip from '$lib/components/ui/Tooltip.svelte';
import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, Hospital, BedDouble } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_admit_modal = $state(false);
	let show_note_modal = $state(false);
	let show_discharge_modal = $state(false);
	let active_record: { id: string; animal_name: string } | null = $state(null);
	let selected_customer_id = $state('');
	let status_filter = $state(data.status_filter);

	const reasons = ['post-surgery','critical-care','observation','fluid-therapy','infection','toxicity','respiratory-distress','trauma','birthing','other'];
	const statuses = ['admitted','stable','critical','improving','discharged','transferred','deceased'];

	const status_badge: Record<string, string> = {
		admitted: 'badge-info', stable: 'badge-success', critical: 'badge-error',
		improving: 'badge-warning', discharged: 'badge-neutral',
		transferred: 'badge-ghost', deceased: 'badge-error'
	};

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};

	function formatPHP(n: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0);
	}

	function stayDays(admitted_at: string, discharged_at?: string) {
		const from = new Date(admitted_at);
		const to = discharged_at ? new Date(discharged_at) : new Date();
		return Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
	}

	let filtered_animals = $derived(
		data.animals.filter((a: typeof data.animals[0]) =>
			!selected_customer_id || a.customer_id === selected_customer_id
		)
	);

	const active_statuses = ['admitted', 'stable', 'critical', 'improving'];
</script>

<svelte:head><title>EasyVet - Hospitalization</title></svelte:head>

<!-- Current inpatients badge -->
<div class="ev-panel p-4 flex items-center gap-3 max-w-48 ev-fade-up">
	<div class="rounded-lg bg-error/10 p-2"><BedDouble class="size-5 text-error" /></div>
	<div>
		<p class="text-xs text-base-content/50 uppercase tracking-wider">Current Inpatients</p>
		<p class="text-2xl font-bold">{data.admitted_count}</p>
	</div>
</div>

<div class="ev-page">
<header class="flex items-center justify-between gap-4">
	<div class="flex gap-2 items-center">
		<select class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs" bind:value={status_filter}
			onchange={() => goto(`/u/hospitalization?status=${status_filter}`)}>
			<option value="">All statuses</option>
			{#each statuses as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
	</div>
	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs" onclick={() => (show_admit_modal = true)}>
		<CirclePlus class="size-3.5" /> Admit Patient
	</button>
</header>

<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<table class="ev-table">
			<thead class="z-20 text-xs">
				<tr>
					<th>Patient</th>
					<th>Owner</th>
					<th>Reason</th>
					<th>Cage / Ward</th>
					<th>Admitted</th>
					<th>Days</th>
					<th>Vet</th>
					<th>Daily Rate</th>
					<th>Est. Total</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.records as r}
					<tr class={['hover:bg-base-200', r.status === 'critical' && 'bg-error/5']}>
						<td>
							<div class="flex items-center gap-1.5">
								<span>{species_emoji[r.animal_id?.species] ?? '🐾'}</span>
								<p class="font-semibold">{r.animal_id?.name ?? '—'}</p>
							</div>
						</td>
						<td>{r.customer_id?.firstname} {r.customer_id?.lastname}</td>
						<td class="capitalize max-w-28 truncate">{r.reason.replace(/-/g, ' ')}</td>
						<td>{r.cage_number || r.ward || '—'}</td>
						<td>{date.formatDate({ date: r.admitted_at, format: 'MMM dd, yyyy' })}</td>
						<td class="font-semibold">{stayDays(r.admitted_at, r.discharged_at)}d</td>
						<td>Dr. {r.attending_vet}</td>
						<td>{formatPHP(r.daily_rate)}</td>
						<td class="font-semibold">
							{formatPHP(r.daily_rate * stayDays(r.admitted_at, r.discharged_at))}
						</td>
						<td>
							<form method="POST" action="?/update_status" use:enhance>
								<input type="hidden" name="id" value={r._id} />
								<select name="status" class="select select-xs"
									onchange={(e) => e.currentTarget.form?.requestSubmit()}>
									{#each statuses as st}
										<option value={st} selected={r.status === st} class="capitalize">{st}</option>
									{/each}
								</select>
							</form>
						</td>
						<td>
							<div class="flex gap-1">
								<button class="btn btn-xs btn-ghost"
									onclick={() => { active_record = { id: r._id, animal_name: r.animal_id?.name }; show_note_modal = true; }}>
									Note
								</button>
								{#if active_statuses.includes(r.status)}
									<button class="btn btn-xs btn-success btn-soft"
										onclick={() => { active_record = { id: r._id, animal_name: r.animal_id?.name }; show_discharge_modal = true; }}>
										Discharge
									</button>
								{/if}
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="11" class="py-12 text-center text-sm text-base-content/40">No hospitalization records found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- Admit Modal -->
{#if show_admit_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-lg max-h-[90vh] overflow-y-auto">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<Hospital class="size-5" /> Admit Patient
				</h3>
				<button onclick={() => (show_admit_modal = false)} class="btn btn-ghost btn-xs btn-circle"><X class="size-4" /></button>
			</div>

			<form method="POST" action="?/admit" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Patient admitted.');
					if (result.type === 'failure') toast.error('Failed to admit patient.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_admit_modal = false; }
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
					<legend class="fieldset-legend">Reason *</legend>
					<select name="reason" class="select select-sm w-full" required>
						{#each reasons as r}
							<option value={r} class="capitalize">{r.replace(/-/g, ' ')}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Attending Vet *</legend>
					<input type="text" name="attending_vet" class="input input-sm w-full" placeholder="Dr. Name" required />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Reason Detail *</legend>
					<input type="text" name="reason_detail" class="input input-sm w-full" placeholder="Detailed reason for admission" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Ward</legend>
					<input type="text" name="ward" class="input input-sm w-full" placeholder="general, ICU..." />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Cage / Room #</legend>
					<input type="text" name="cage_number" class="input input-sm w-full" placeholder="e.g. B-3" />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Daily Rate (₱)</legend>
					<input type="number" name="daily_rate" min="0" step="0.01" class="input input-sm w-full" placeholder="1200.00" />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Expected Discharge</legend>
					<input type="date" name="expected_discharge" class="input input-sm w-full" />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Admission Notes</legend>
					<textarea name="admission_notes" class="textarea textarea-sm w-full" rows="2" placeholder="Initial condition, treatment plan..."></textarea>
				</fieldset>

				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_admit_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Admit</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_admit_modal = false)}></div>
	</div>
{/if}

<!-- Progress Note Modal -->
{#if show_note_modal && active_record}
	<div class="modal modal-open">
		<div class="modal-box max-w-md">
			<h3 class="text-lg font-bold mb-4">Progress Note — {active_record.animal_name}</h3>
			<form method="POST" action="?/add_note" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Progress note saved.');
					if (result.type === 'failure') toast.error('Failed to save note.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_note_modal = false; active_record = null; }
				};
			}} class="flex flex-col gap-3">
				<input type="hidden" name="id" value={active_record.id} />
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Noted By *</legend>
					<input type="text" name="noted_by" class="input input-sm w-full" placeholder="Staff name" required />
				</fieldset>
				<div class="grid grid-cols-3 gap-2">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Temp (°C)</legend>
						<input type="number" name="temperature_c" step="0.1" class="input input-sm w-full" />
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">HR (bpm)</legend>
						<input type="number" name="heart_rate_bpm" class="input input-sm w-full" />
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Weight (kg)</legend>
						<input type="number" name="weight_kg" step="0.01" class="input input-sm w-full" />
					</fieldset>
				</div>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Note *</legend>
					<textarea name="note" class="textarea textarea-sm w-full" rows="3" placeholder="Patient condition, response to treatment..." required></textarea>
				</fieldset>
				<div class="modal-action">
					<button type="button" onclick={() => { show_note_modal = false; active_record = null; }} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Save Note</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => { show_note_modal = false; active_record = null; }}></div>
	</div>
{/if}

<!-- Discharge Modal -->
{#if show_discharge_modal && active_record}
	<div class="modal modal-open">
		<div class="modal-box max-w-md">
			<h3 class="text-lg font-bold mb-4">Discharge — {active_record.animal_name}</h3>
			<form method="POST" action="?/discharge" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Patient discharged.');
					if (result.type === 'failure') toast.error('Failed to discharge patient.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_discharge_modal = false; active_record = null; }
				};
			}} class="flex flex-col gap-3">
				<input type="hidden" name="id" value={active_record.id} />
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Discharge Notes</legend>
					<textarea name="discharge_notes" class="textarea textarea-sm w-full" rows="2" placeholder="Summary of stay, outcomes..."></textarea>
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Discharge Instructions (for owner)</legend>
					<textarea name="discharge_instructions" class="textarea textarea-sm w-full" rows="3" placeholder="Medications, follow-up care..."></textarea>
				</fieldset>
				<div class="modal-action">
					<button type="button" onclick={() => { show_discharge_modal = false; active_record = null; }} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-success btn-sm">Confirm Discharge</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => { show_discharge_modal = false; active_record = null; }}></div>
	</div>
{/if}
