<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import { ArrowLeft, Weight, Stethoscope, ChevronDown, ChevronUp, X } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { animal, inventory } = data;
	const owner = animal.customer_id;

	let show_weight_modal = $state(false);
	let show_record_modal = $state(false);
	let expanded_record = $state<string | null>(null);

	// Inventory items selected for current medical record
	let selected_inventory: {
		id: string;
		name: string;
		unit_price: number;
		qty: number;
		unit: string;
	}[] = $state([]);

	function addInventoryItem(item: (typeof inventory)[0]) {
		if (selected_inventory.find((i) => i.id === item._id)) return;
		selected_inventory = [
			...selected_inventory,
			{ id: item._id, name: item.name, unit_price: item.unit_price, qty: 1, unit: item.unit }
		];
	}
	function removeInventoryItem(id: string) {
		selected_inventory = selected_inventory.filter((i) => i.id !== id);
	}

	function formatPHP(n: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);
	}

	const sorted_records = [...(animal.medical_records ?? [])].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	// const latest_weight = [...(animal.medical_records ?? [])].length
	// 	? animal.weight_history?.at(-1)
	// 	: null;

	const visit_badge: Record<string, string> = {
		checkup: 'badge-info',
		vaccination: 'badge-success',
		surgery: 'badge-error',
		emergency: 'badge-error',
		dental: 'badge-warning',
		'follow-up': 'badge-ghost',
		grooming: 'badge-secondary',
		laboratory: 'badge-primary'
	};

	const vacc_badge: Record<string, string> = {
		'up-to-date': 'badge-success',
		overdue: 'badge-error',
		unknown: 'badge-ghost'
	};

	const species_emoji: Record<string, string> = {
		dog: '🐕',
		cat: '🐈',
		bird: '🦜',
		rabbit: '🐇',
		reptile: '🦎',
		fish: '🐟',
		other: '🐾'
	};

	function getAge(dob: string) {
		const birth = new Date(dob);
		const now = new Date();
		const years = now.getFullYear() - birth.getFullYear();
		const months = now.getMonth() - birth.getMonth();
		if (years === 0) return `${Math.max(0, months)} months`;
		if (years < 2) return `${years}y ${Math.abs(months)}mo`;
		return `${years} years`;
	}

	let inventory_search = $state('');
	let filtered_inventory = $derived(
		inventory.filter(
			(i: (typeof inventory)[0]) =>
				i.name.toLowerCase().includes(inventory_search.toLowerCase()) ||
				i.sku.toLowerCase().includes(inventory_search.toLowerCase())
		)
	);
</script>

<svelte:head><title>EasyVet - {animal.name}</title></svelte:head>

<div class="flex h-full w-full flex-col gap-4 p-5">
	<!-- Back nav -->
	<div class="flex items-center gap-2">
		<a href={resolve('/u/animals')} class="btn gap-1 btn-ghost btn-xs">
			<ArrowLeft class="size-3" /> Animals
		</a>
		<span class="text-base-content/30">/</span>
		<span class="text-xs font-semibold">{animal.name}</span>
	</div>

	<div class="flex h-full min-h-0 flex-row gap-4">
		<!-- Left: Profile Card -->
		<aside class="ev-panel flex w-64 min-w-56 flex-col gap-4 bg-base-100 p-5">
			<!-- Avatar & name -->
			<div class="flex flex-col items-center gap-2 text-center">
				<div class="avatar rounded bg-secondary/10 text-5xl">
					<div class="flex size-20 items-center justify-center">
						{species_emoji[animal.species] ?? '🐾'}
					</div>
				</div>
				<div>
					<h2 class="text-lg font-bold">{animal.name}</h2>
					<p class="text-xs text-base-content/50 capitalize">{animal.species} · {animal.breed}</p>
				</div>
				<div class="flex flex-wrap justify-center gap-1">
					<span class="badge badge-xs {vacc_badge[animal.vaccination_status]} capitalize">
						{animal.vaccination_status.replace('-', ' ')}
					</span>
					{#if animal.is_neutered}
						<span class="badge badge-xs badge-neutral">Neutered</span>
					{/if}
				</div>
			</div>

			<div class="divider-thin divider my-0"></div>

			<!-- Stats grid -->
			<div class="grid grid-cols-2 gap-2 text-center text-xs">
				<div class="rounded-lg bg-base-200 p-2">
					<p class="text-base-content/40">Age</p>
					<p class="font-bold">{getAge(animal.dob)}</p>
				</div>
				<div class="rounded-lg bg-base-200 p-2">
					<p class="text-base-content/40">Sex</p>
					<p class="font-bold capitalize">{animal.sex}</p>
				</div>
				<div class="rounded-lg bg-base-200 p-2">
					<p class="text-base-content/40">Weight</p>
					<p class="font-bold">
						{animal.weight_history?.length ? animal.weight_history.at(-1).weight_kg + ' kg' : '—'}
					</p>
				</div>
				<div class="rounded-lg bg-base-200 p-2">
					<p class="text-base-content/40">Visits</p>
					<p class="font-bold">{animal.medical_records?.length ?? 0}</p>
				</div>
			</div>

			<div class="divider-thin divider my-0"></div>

			<!-- Owner info -->
			<div>
				<p class="mb-1 text-xs font-semibold tracking-wider text-base-content/40 uppercase">
					Owner
				</p>
				<a href={resolve(`/u/customers/${owner?._id}`)} class="hover:underline">
					<p class="text-sm font-semibold">{owner?.firstname} {owner?.lastname}</p>
				</a>
				<p class="text-xs text-base-content/50">{owner?.contact_number ?? '—'}</p>
			</div>

			{#if animal.allergies?.length}
				<div>
					<p class="mb-1 text-xs font-semibold tracking-wider text-base-content/40 uppercase">
						Allergies
					</p>
					<div class="flex flex-wrap gap-1">
						{#each animal.allergies as allergy, i (i)}
							<span class="badge badge-outline badge-xs badge-error">{allergy}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if animal.microchip_id}
				<div>
					<p class="mb-1 text-xs font-semibold tracking-wider text-base-content/40 uppercase">
						Microchip
					</p>
					<p class="font-mono text-xs">{animal.microchip_id}</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="mt-auto flex flex-col gap-2">
				<button
					onclick={() => (show_weight_modal = true)}
					class="btn w-full gap-1 btn-outline btn-sm btn-primary"
				>
					<Weight class="size-3.5" /> Log Weight
				</button>
				<button
					onclick={() => (show_record_modal = true)}
					class="btn w-full gap-1 btn-sm btn-primary"
				>
					<Stethoscope class="size-3.5" /> New Visit Record
				</button>
			</div>
		</aside>

		<!-- Right: Tabs -->
		<div class="tabs-lift tabs min-w-0 grow">
			<!-- Medical Records Tab -->
			<label
				class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
			>
				<input type="radio" name="tab_animal" checked />
				<Stethoscope class="me-2 size-4" /> Medical Records
			</label>
			<div class="tab-content overflow-y-auto rounded-ss-none border-transparent bg-base-100 p-4">
				{#if sorted_records.length === 0}
					<div class="flex h-40 items-center justify-center">
						<p class="text-sm text-base-content/40">No medical records yet.</p>
					</div>
				{:else}
					<ul class="space-y-2">
						{#each sorted_records as record, i (i)}
							{@const is_open = expanded_record === record._id}
							{@const v = record.vital_signs}
							<li class="bg-base-50 overflow-hidden rounded-xl border border-base-200">
								<button
									class="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-base-200"
									onclick={() => (expanded_record = is_open ? null : record._id)}
								>
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<span
												class="badge badge-sm {visit_badge[record.visit_type] ??
													'badge-ghost'} capitalize"
											>
												{record.visit_type}
											</span>
											<span class="text-sm font-semibold">{record.chief_complaint}</span>
										</div>
										<p class="mt-0.5 text-xs text-base-content/50">
											{date.formatDate({
												date: record.createdAt,
												format: 'MMMM dd, yyyy hh:mm aa'
											})}
											· Dr. {record.veterinarian}
										</p>
									</div>
									<div class="text-right text-sm font-bold">
										{formatPHP(record.service_fee)}
									</div>
									{#if is_open}
										<ChevronUp class="size-4 text-base-content/40" />
									{:else}
										<ChevronDown class="size-4 text-base-content/40" />
									{/if}
								</button>

								{#if is_open}
									<div class="space-y-3 border-t border-base-200 px-4 pt-3 pb-4 text-xs">
										{#if record.diagnosis}
											<div>
												<p
													class="mb-0.5 font-semibold tracking-wider text-base-content/60 uppercase"
												>
													Diagnosis
												</p>
												<p>{record.diagnosis}</p>
											</div>
										{/if}
										{#if record.treatment}
											<div>
												<p
													class="mb-0.5 font-semibold tracking-wider text-base-content/60 uppercase"
												>
													Treatment
												</p>
												<p>{record.treatment}</p>
											</div>
										{/if}
										{#if record.prescriptions?.length}
											<div>
												<p
													class="mb-0.5 font-semibold tracking-wider text-base-content/60 uppercase"
												>
													Prescriptions
												</p>
												<ul class="list-inside list-disc space-y-0.5">
													{#each record.prescriptions as rx, i (i)}<li>{rx}</li>{/each}
												</ul>
											</div>
										{/if}
										<!-- Vitals -->
										{#if v?.temperature_c || v?.heart_rate_bpm || v?.respiratory_rate}
											<div>
												<p class="mb-1 font-semibold tracking-wider text-base-content/60 uppercase">
													Vital Signs
												</p>
												<div class="flex gap-4">
													{#if v.temperature_c}<span>🌡 {v.temperature_c}°C</span>{/if}
													{#if v.heart_rate_bpm}<span>💓 {v.heart_rate_bpm} bpm</span>{/if}
													{#if v.respiratory_rate}<span>🫁 {v.respiratory_rate} /min</span>{/if}
												</div>
											</div>
										{/if}
										<!-- Inventory used -->
										{#if record.inventory_used?.length}
											<div>
												<p class="mb-1 font-semibold tracking-wider text-base-content/60 uppercase">
													Items Used
												</p>
												<table class="table w-full table-xs">
													<thead
														><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr
														></thead
													>
													<tbody>
														{#each record.inventory_used as item, i (i)}
															<tr>
																<td>{item.item_name}</td>
																<td>{item.quantity}</td>
																<td>{formatPHP(item.unit_price)}</td>
																<td>{formatPHP(item.quantity * item.unit_price)}</td>
															</tr>
														{/each}
													</tbody>
												</table>
											</div>
										{/if}
										{#if record.notes}
											<div>
												<p
													class="mb-0.5 font-semibold tracking-wider text-base-content/60 uppercase"
												>
													Notes
												</p>
												<p class="text-base-content/70">{record.notes}</p>
											</div>
										{/if}
										{#if record.next_visit_date}
											<p class="font-semibold text-primary">
												Next visit: {date.formatDate({
													date: record.next_visit_date,
													format: 'MMM dd, yyyy'
												})}
											</p>
										{/if}
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Weight History Tab -->
			<label
				class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
			>
				<input type="radio" name="tab_animal" />
				<Weight class="me-2 size-4" /> Weight History
			</label>
			<div class="tab-content overflow-y-auto border-transparent bg-base-100 p-4">
				{#if !animal.weight_history?.length}
					<div class="flex h-40 items-center justify-center">
						<p class="text-sm text-base-content/40">No weight records yet.</p>
					</div>
				{:else}
					<table class="table table-sm">
						<thead class="text-xs">
							<tr><th>Date</th><th>Weight</th><th>Recorded By</th></tr>
						</thead>
						<tbody class="text-xs">
							{#each [...animal.weight_history].reverse() as entry, i (i)}
								<tr>
									<td
										>{date.formatDate({
											date: entry.createdAt,
											format: 'MMM dd, yyyy hh:mm aa'
										})}</td
									>
									<td class="font-bold">{entry.weight_kg} kg</td>
									<td>{entry.recorded_by}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- ── Weight Modal ───────────────────────────────────────── -->
{#if show_weight_modal}
	<div class="modal-open modal">
		<div class="modal-box max-w-sm">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold">Log Weight</h3>
				<button onclick={() => (show_weight_modal = false)} class="btn btn-circle btn-ghost btn-xs">
					<X class="size-4" />
				</button>
			</div>
			<form
				method="POST"
				action="?/add_weight"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						show_weight_modal = false;
					};
				}}
			>
				<div class="flex flex-col gap-3">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Weight (kg) *</legend>
						<input
							type="number"
							name="weight_kg"
							step="0.01"
							min="0.01"
							max="999"
							class="input input-sm w-full"
							placeholder="e.g. 12.5"
							required
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Recorded By</legend>
						<input
							type="text"
							name="recorded_by"
							class="input input-sm w-full"
							placeholder="Staff name"
						/>
					</fieldset>
				</div>
				<div class="modal-action">
					<button
						type="button"
						onclick={() => (show_weight_modal = false)}
						class="btn btn-ghost btn-sm">Cancel</button
					>
					<button type="submit" class="btn btn-sm btn-primary">Save</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_weight_modal = false)}></div>
	</div>
{/if}

<!-- ── Medical Record Modal ──────────────────────────────── -->
{#if show_record_modal}
	<div class="modal-open modal">
		<div class="modal-box max-h-[90vh] max-w-2xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-bold">New Visit Record — {animal.name}</h3>
				<button
					onclick={() => {
						show_record_modal = false;
						selected_inventory = [];
					}}
					class="btn btn-circle btn-ghost btn-xs"
				>
					<X class="size-4" />
				</button>
			</div>

			<form
				method="POST"
				action="?/add_record"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						show_record_modal = false;
						selected_inventory = [];
					};
				}}
				class="flex flex-col gap-4 overflow-y-auto"
			>
				<div class="grid grid-cols-2 gap-3">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Visit Type *</legend>
						<select name="visit_type" class="select w-full select-sm" required>
							{#each ['checkup', 'vaccination', 'surgery', 'emergency', 'dental', 'follow-up', 'grooming', 'laboratory'] as t, i (i)}
								<option value={t} class="capitalize">{t}</option>
							{/each}
						</select>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Veterinarian *</legend>
						<input
							type="text"
							name="veterinarian"
							class="input input-sm w-full"
							placeholder="Dr. Name"
							required
						/>
					</fieldset>

					<fieldset class="col-span-2 fieldset">
						<legend class="fieldset-legend">Chief Complaint *</legend>
						<input
							type="text"
							name="chief_complaint"
							class="input input-sm w-full"
							placeholder="Reason for visit"
							required
						/>
					</fieldset>

					<fieldset class="col-span-2 fieldset">
						<legend class="fieldset-legend">Diagnosis</legend>
						<textarea
							name="diagnosis"
							class="textarea w-full textarea-sm"
							rows="2"
							placeholder="Clinical findings..."
						></textarea>
					</fieldset>

					<fieldset class="col-span-2 fieldset">
						<legend class="fieldset-legend">Treatment</legend>
						<textarea
							name="treatment"
							class="textarea w-full textarea-sm"
							rows="2"
							placeholder="Treatment administered..."
						></textarea>
					</fieldset>

					<fieldset class="col-span-2 fieldset">
						<legend class="fieldset-legend">Prescriptions (comma-separated)</legend>
						<input
							type="text"
							name="prescriptions"
							class="input input-sm w-full"
							placeholder="e.g. Amoxicillin 250mg, Vitamins"
						/>
					</fieldset>
				</div>

				<!-- Vitals -->
				<div>
					<p class="mb-2 text-xs font-semibold tracking-wider text-base-content/50 uppercase">
						Vital Signs
					</p>
					<div class="grid grid-cols-3 gap-2">
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Temp (°C)</legend>
							<input
								type="number"
								name="temperature_c"
								step="0.1"
								class="input input-sm w-full"
								placeholder="38.5"
							/>
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Heart Rate (bpm)</legend>
							<input
								type="number"
								name="heart_rate_bpm"
								class="input input-sm w-full"
								placeholder="80"
							/>
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend">Resp. Rate (/min)</legend>
							<input
								type="number"
								name="respiratory_rate"
								class="input input-sm w-full"
								placeholder="20"
							/>
						</fieldset>
					</div>
				</div>

				<!-- Inventory used -->
				<div>
					<p class="mb-2 text-xs font-semibold tracking-wider text-base-content/50 uppercase">
						Items / Medicines Used
					</p>
					<input
						type="text"
						placeholder="Search inventory..."
						class="input input-sm mb-2 w-full"
						bind:value={inventory_search}
					/>
					<div class="mb-2 max-h-32 overflow-y-auto rounded-lg border border-base-200">
						{#each filtered_inventory.slice(0, 20) as item, i (i)}
							<button
								type="button"
								class="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-base-200"
								onclick={() => addInventoryItem(item)}
							>
								<span>{item.name} <span class="text-base-content/40">({item.sku})</span></span>
								<span class="font-semibold text-primary"
									>{formatPHP(item.unit_price)}/{item.unit}</span
								>
							</button>
						{/each}
					</div>

					{#if selected_inventory.length}
						<table class="table table-xs">
							<thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th></th></tr></thead>
							<tbody>
								{#each selected_inventory as item, i (i)}
									<tr>
										<td>
											{item.name}
											<input type="hidden" name="inv_id[]" value={item.id} />
											<input type="hidden" name="inv_name[]" value={item.name} />
											<input type="hidden" name="inv_unit_price[]" value={item.unit_price} />
										</td>
										<td>
											<input
												type="number"
												name="inv_qty[]"
												min="1"
												class="input input-xs w-16"
												bind:value={item.qty}
											/>
										</td>
										<td>{formatPHP(item.unit_price)}</td>
										<td>
											<button
												type="button"
												onclick={() => removeInventoryItem(item.id)}
												class="btn btn-circle text-error btn-ghost btn-xs"
											>
												<X class="size-3" />
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-3">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Service Fee (₱)</legend>
						<input
							type="number"
							name="service_fee"
							min="0"
							step="0.01"
							class="input input-sm w-full"
							placeholder="0.00"
						/>
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Next Visit Date</legend>
						<input type="date" name="next_visit_date" class="input input-sm w-full" />
					</fieldset>

					<fieldset class="col-span-2 fieldset">
						<legend class="fieldset-legend">Notes</legend>
						<textarea
							name="notes"
							class="textarea w-full textarea-sm"
							rows="2"
							placeholder="Additional notes..."
						></textarea>
					</fieldset>
				</div>

				<div class="modal-action">
					<button
						type="button"
						onclick={() => {
							show_record_modal = false;
							selected_inventory = [];
						}}
						class="btn btn-ghost btn-sm">Cancel</button
					>
					<button type="submit" class="btn btn-sm btn-primary">Save Record</button>
				</div>
			</form>
		</div>
		<div
			class="modal-backdrop"
			onclick={() => {
				show_record_modal = false;
				selected_inventory = [];
			}}
		></div>
	</div>
{/if}
