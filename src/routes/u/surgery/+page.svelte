<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { date } from '$lib/utils/helper';
	import { CirclePlus, X, Slice, CalendarCheck, CheckCircle, Clock } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let selected_customer_id = $state('');
	let status_filter = $state(data.status_filter);

	const surgery_types = ['spay','neuter','mass-removal','wound-repair','fracture-repair','dental-extraction','foreign-body-removal','exploratory-laparotomy','caesarean','eye-surgery','ear-surgery','orthopedic','other'];
	const anesthesia_types = ['local','general-injectable','general-inhalant','epidural','none'];
	const statuses = ['scheduled','prep','in-progress','completed','cancelled','postponed'];

	const status_badge: Record<string, string> = {
		scheduled: 'badge-info', prep: 'badge-warning', 'in-progress': 'badge-warning',
		completed: 'badge-success', cancelled: 'badge-neutral', postponed: 'badge-ghost'
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

<svelte:head><title>EasyVet - Surgery</title></svelte:head>

<!-- Stats -->
<div class="grid grid-cols-3 gap-3 ev-fade-up">
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-info/10 p-2"><CalendarCheck class="size-5 text-info" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Today</p>
			<p class="text-xl font-bold">{data.stats.today_count}</p>
		</div>
	</div>
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-warning/10 p-2"><Clock class="size-5 text-warning" /></div>
		<div>
			<p class="text-xs text-base-content/50 uppercase tracking-wider">Scheduled</p>
			<p class="text-xl font-bold">{data.stats.scheduled_count}</p>
		</div>
	</div>
	<div class="ev-panel p-4 flex items-center gap-3">
		<div class="rounded-lg bg-success/10 p-2"><CheckCircle class="size-5 text-success" /></div>
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
			onchange={() => goto(`/u/surgery?status=${status_filter}`)}>
			<option value="">All statuses</option>
			{#each statuses as s}
				<option value={s} class="capitalize">{s}</option>
			{/each}
		</select>
	</div>
	<button class="btn btn-sm btn-primary flex items-center gap-1 pr-3.5 text-xs" onclick={() => (show_modal = true)}>
		<CirclePlus class="size-3.5" /> Schedule Surgery
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
					<th>Description</th>
					<th>Scheduled</th>
					<th>Surgeon</th>
					<th>Anesthesia</th>
					<th>Fee</th>
					<th>Consent</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody class="z-10 text-xs">
				{#each data.surgeries as s}
					<tr class="hover:bg-base-200">
						<td>
							<div class="flex items-center gap-1.5">
								<span>{species_emoji[s.animal_id?.species] ?? '🐾'}</span>
								<p class="font-semibold">{s.animal_id?.name ?? '—'}</p>
							</div>
						</td>
						<td>{s.customer_id?.firstname} {s.customer_id?.lastname}</td>
						<td class="capitalize">{s.type.replace(/-/g, ' ')}</td>
						<td class="max-w-32 truncate">{s.description}</td>
						<td>
							<p class="font-semibold">{date.formatDate({ date: s.scheduled_at, format: 'MMM dd, yyyy' })}</p>
							<p class="text-base-content/40">{date.formatDate({ date: s.scheduled_at, format: 'hh:mm aa' })}</p>
						</td>
						<td>Dr. {s.surgeon}</td>
						<td class="capitalize">{s.anesthesia_type?.replace(/-/g, ' ')}</td>
						<td>{formatPHP(s.service_fee)}</td>
						<td>
							{#if s.consent_obtained}
								<span class="badge badge-xs badge-success">Yes</span>
							{:else}
								<span class="badge badge-xs badge-error">No</span>
							{/if}
						</td>
						<td>
							<form method="POST" action="?/update_status" use:enhance>
								<input type="hidden" name="id" value={s._id} />
								<select name="status" class="select select-xs"
									onchange={(e) => e.currentTarget.form?.requestSubmit()}>
									{#each statuses as st}
										<option value={st} selected={s.status === st} class="capitalize">{st}</option>
									{/each}
								</select>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="10" class="py-12 text-center text-sm text-base-content/40">No surgery records found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<Pagination total={data.total} />
</div>

<!-- Schedule Surgery Modal -->
{#if show_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold flex items-center gap-2">
					<Slice class="size-5" /> Schedule Surgery
				</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-ghost btn-xs btn-circle"><X class="size-4" /></button>
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
							<option value={a._id}>{a.name}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Surgery Type *</legend>
					<select name="type" class="select select-sm w-full" required>
						{#each surgery_types as t}
							<option value={t} class="capitalize">{t.replace(/-/g, ' ')}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Scheduled At *</legend>
					<input type="datetime-local" name="scheduled_at" class="input input-sm w-full" required />
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Description / Procedure *</legend>
					<input type="text" name="description" class="input input-sm w-full" placeholder="Brief description of procedure" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Surgeon *</legend>
					<input type="text" name="surgeon" class="input input-sm w-full" placeholder="Dr. Name" required />
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Anesthesia Type</legend>
					<select name="anesthesia_type" class="select select-sm w-full">
						{#each anesthesia_types as t}
							<option value={t} class="capitalize">{t.replace(/-/g, ' ')}</option>
						{/each}
					</select>
				</fieldset>

				<fieldset class="fieldset col-span-2">
					<legend class="fieldset-legend">Pre-op Notes</legend>
					<textarea name="pre_op_notes" class="textarea textarea-sm w-full" rows="2" placeholder="Fasting instructions, pre-medication..."></textarea>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Service Fee (₱)</legend>
					<input type="number" name="service_fee" min="0" step="0.01" class="input input-sm w-full" />
				</fieldset>

				<div class="flex items-center gap-2 pt-5">
					<input type="checkbox" id="consent" name="consent_obtained" class="checkbox checkbox-sm checkbox-primary" />
					<label for="consent" class="text-sm">Consent obtained from owner</label>
				</div>

				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Schedule</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}
