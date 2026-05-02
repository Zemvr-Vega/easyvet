<script lang="ts">
	import { toast } from '$lib/stores/toast';
import Tooltip from '$lib/components/ui/Tooltip.svelte';
import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, FlaskConical } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let show_result_modal = $state(false);
	let result_target: { id: string; name: string; status: string } | null = $state(null);
	let selected_customer_id = $state('');
	let status_filter = $state(data.status_filter);

	const test_types = ['cbc','blood-chemistry','urinalysis','fecal-exam','skin-scraping','cytology','culture-sensitivity','heartworm-test','parvo-test','felv-fiv-test','xray','ultrasound','ecg','other'];
	const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];

	const status_badge: Record<string, string> = {
		pending: 'badge-warning', 'in-progress': 'badge-info',
		completed: 'badge-success', cancelled: 'badge-neutral'
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

<svelte:head><title>EasyVet - Laboratory</title></svelte:head>

<!-- Stats -->
<div class="grid grid-cols-2 gap-3 ev-fade-up">
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-warning/10 p-2"><FlaskConical class="size-5 text-warning" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Pending Tests</p>
			<p class="text-xl font-bold">{data.stats.pending_count}</p>
		</div>
	</div>
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-success/10 p-2"><FlaskConical class="size-5 text-success" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Completed</p>
			<p class="text-xl font-bold">{data.stats.completed_count}</p>
		</div>
	</div>
</div>

<div class="ev-page">
<header class="flex items-center justify-between gap-4">
	<div class="flex gap-2 items-center">
		<select class="select select-sm bg-base-200 border-base-content/10 text-base-content/70 text-xs" bind:value={status_filter}
			onchange={() => goto(`/u/laboratory?status=${status_filter}`)}>
			<option value="">All statuses</option>
			{#each statuses as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
	</div>
	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs" onclick={() => (show_modal = true)}>
		<CirclePlus class="size-3.5" /> Request Test
	</button>
</header>

<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
	<div class="min-h-0 flex-1 overflow-y-auto">
		<table class="ev-table">
			<thead class="z-20 text-xs">
				<tr>
					<th>Patient</th>
					<th>Owner</th>
					<th>Test</th>
					<th>Type</th>
					<th>Requested</th>
					<th>Requested By</th>
					<th>Summary</th>
					<th>Fee</th>
					<th>Status</th>
					<th></th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.tests as t}
					<tr class="hover:bg-base-200">
						<td>
							<div class="flex items-center gap-1.5">
								<span>{species_emoji[t.animal_id?.species] ?? '🐾'}</span>
								<p class="font-semibold">{t.animal_id?.name ?? '—'}</p>
							</div>
						</td>
						<td>{t.customer_id?.firstname} {t.customer_id?.lastname}</td>
						<td class="font-semibold">{t.test_name}</td>
						<td class="uppercase text-xs">{t.test_type}</td>
						<td>{date.formatDate({ date: t.requested_date, format: 'MMM dd, yyyy' })}</td>
						<td>Dr. {t.requested_by}</td>
						<td class="max-w-40 truncate text-base-content/60">{t.result_summary || '—'}</td>
						<td>{formatPHP(t.service_fee)}</td>
						<td>
							<span class="badge badge-xs {status_badge[t.status]} capitalize">{t.status}</span>
						</td>
						<td>
							{#if t.status !== 'completed' && t.status !== 'cancelled'}
								<button class="btn btn-xs btn-ghost"
									onclick={() => { result_target = { id: t._id, name: t.test_name, status: t.status }; show_result_modal = true; }}>
									Update
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="10" class="py-12 text-center text-sm text-base-content/40">No lab tests found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- Request Test Modal -->
{#if show_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-lg">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<FlaskConical class="size-5" /> Request Lab Test
				</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-ghost btn-xs btn-circle"><X class="size-4" /></button>
			</div>

			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Lab test requested.');
					if (result.type === 'failure') toast.error('Failed to request test.');
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
					<legend class="fieldset-legend">Test Type *</legend>
					<select name="test_type" class="select select-sm w-full" required>
						{#each test_types as t}
							<option value={t} class="uppercase">{t.toUpperCase()}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Test Name *</legend>
					<input type="text" name="test_name" class="input input-sm w-full" placeholder="e.g. Complete Blood Count" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Requested By (Vet) *</legend>
					<input type="text" name="requested_by" class="input input-sm w-full" placeholder="Dr. Name" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Sample Type</legend>
					<input type="text" name="sample_type" class="input input-sm w-full" placeholder="blood, urine, stool..." />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Service Fee (₱)</legend>
					<input type="number" name="service_fee" min="0" step="0.01" class="input input-sm w-full" />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Notes</legend>
					<textarea name="notes" class="textarea textarea-sm w-full" rows="2"></textarea>
				</fieldset>

				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Request</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}

<!-- Update Result Modal -->
{#if show_result_modal && result_target}
	<div class="modal modal-open">
		<div class="modal-box max-w-md">
			<h3 class="text-lg font-bold mb-4">Update — {result_target.name}</h3>
			<form method="POST" action="?/update_result" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Result updated.');
					if (result.type === 'failure') toast.error('Failed to update result.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_result_modal = false; result_target = null; }
				};
			}} class="flex flex-col gap-3">
				<input type="hidden" name="id" value={result_target.id} />
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Status</legend>
					<select name="status" class="select select-sm w-full">
						{#each statuses as s}
							<option value={s} selected={result_target.status === s} class="capitalize">{s}</option>
						{/each}
					</select>
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Performed By</legend>
					<input type="text" name="performed_by" class="input input-sm w-full" placeholder="Lab technician / Vet" />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Result Summary</legend>
					<textarea name="result_summary" class="textarea textarea-sm w-full" rows="3" placeholder="Key findings..."></textarea>
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Interpretation</legend>
					<textarea name="result_interpretation" class="textarea textarea-sm w-full" rows="2" placeholder="Clinical interpretation..."></textarea>
				</fieldset>
				<div class="modal-action">
					<button type="button" onclick={() => { show_result_modal = false; result_target = null; }} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Save</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => { show_result_modal = false; result_target = null; }}></div>
	</div>
{/if}
