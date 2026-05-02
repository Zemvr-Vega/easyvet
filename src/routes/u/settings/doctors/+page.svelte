<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { CirclePlus, X, Stethoscope, Search, Bell } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let show_notify_modal = $state(false);
	let notify_target: typeof data.doctors[0] | null = $state(null);
	let search_input = $state(data.search);

	const specializations = [
		'general-practice','surgery','internal-medicine','dermatology','ophthalmology',
		'dentistry','oncology','cardiology','neurology','orthopedics',
		'emergency-critical-care','exotic-animals','radiology','rehabilitation','other'
	];
	const statuses = ['active','on-leave','inactive'];
	const status_badge: Record<string,string> = {
		active: 'badge-success', 'on-leave': 'badge-warning', inactive: 'badge-ghost'
	};

	function doSearch() {
		const p = new URLSearchParams();
		if (search_input) p.set('q', search_input);
		p.set('page','1'); p.set('size', String(data.size));
		goto(`/u/settings/doctors?${p}`);
	}

	function openNotify(doctor: typeof data.doctors[0]) {
		notify_target = doctor;
		show_notify_modal = true;
	}
</script>

<div class="flex h-full flex-col gap-4">
	<!-- Toolbar -->
	<div class="flex items-center justify-between">
		<form onsubmit={(e) => { e.preventDefault(); doSearch(); }} class="flex items-center gap-2">
			<div class="ev-search-wrap w-52">
				<Search />
				<input type="text" class="ev-search" placeholder="Search doctors..." bind:value={search_input} />
			</div>
			<button type="submit" class="btn btn-sm btn-ghost text-xs">Search</button>
		</form>
		<button class="btn btn-sm btn-primary gap-1.5" onclick={() => (show_modal = true)}>
			<CirclePlus class="size-3.5" strokeWidth={2.5} /> Add Doctor
		</button>
	</div>

	<!-- Table -->
	<div class="ev-panel min-h-0 flex-1 flex flex-col overflow-hidden">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<table class="ev-table">
				<thead>
					<tr>
						<th>Doctor</th>
						<th>License</th>
						<th>Specialization</th>
						<th>Email</th>
						<th>Status</th>
						<th>Notifications</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.doctors as doc}
						<tr>
							<td>
								<div class="flex items-center gap-2.5">
									<div class="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/15 text-xs font-bold text-secondary flex-shrink-0">
										{doc.firstname[0]}{doc.lastname[0]}
									</div>
									<div>
										<p class="font-semibold text-base-content text-sm">Dr. {doc.firstname} {doc.lastname}</p>
										<p class="text-xs text-base-content/40">{doc.phone || '—'}</p>
									</div>
								</div>
							</td>
							<td class="font-mono text-xs text-base-content/60">{doc.license_number}</td>
							<td class="text-xs capitalize text-base-content/70">{doc.specialization?.replace(/-/g,' ')}</td>
							<td class="text-xs text-base-content/60">{doc.email}</td>
							<td>
								<form method="POST" action="?/update_status" use:enhance>
									<input type="hidden" name="id" value={doc._id} />
									<select name="status" class="select select-xs"
										onchange={(e) => e.currentTarget.form?.requestSubmit()}>
										{#each statuses as s}
											<option value={s} selected={doc.status === s} class="capitalize">{s}</option>
										{/each}
									</select>
								</form>
							</td>
							<td>
								<button class="btn btn-xs btn-soft btn-primary gap-1" onclick={() => openNotify(doc)}>
									<Bell class="size-3" /> Configure
								</button>
							</td>
							<td>
								<form method="POST" action="?/archive" use:enhance>
									<input type="hidden" name="id" value={doc._id} />
									<button type="submit" class="btn btn-xs btn-ghost text-error/60 hover:text-error"
										onclick={(e) => { if (!confirm(`Archive Dr. ${doc.lastname}?`)) e.preventDefault(); }}>
										<X class="size-3" />
									</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr><td colspan="7">
							<div class="ev-empty">
								<Stethoscope class="size-8" />
								<p class="text-sm font-medium">No doctors found</p>
							</div>
						</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<Pagination total={data.total} />
</div>

<!-- Add Doctor Modal -->
{#if show_modal}
	<div class="modal modal-open">
		<div class="modal-box max-w-lg">
			<div class="mb-5 flex items-center justify-between">
				<h3 class="text-base font-bold">Add Doctor</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm btn-circle">
					<X class="size-4" />
				</button>
			</div>
			<form method="POST" action="?/create" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Doctor profile created.');
					if (result.type === 'failure') toast.error('Failed to create doctor profile.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_modal = false; }
				};
			}} class="grid grid-cols-2 gap-3">
				<fieldset class="fieldset">
					<label class="label" for="d_firstname">First Name <span class="text-error">*</span></label>
					<input id="d_firstname" name="firstname" type="text" class="input input-sm w-full" placeholder="Maria" required />
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="d_lastname">Last Name <span class="text-error">*</span></label>
					<input id="d_lastname" name="lastname" type="text" class="input input-sm w-full" placeholder="Santos" required />
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="d_email">Email <span class="text-error">*</span></label>
					<input id="d_email" name="email" type="email" class="input input-sm w-full" placeholder="dr.santos@clinic.com" required />
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="d_license">License Number <span class="text-error">*</span></label>
					<input id="d_license" name="license_number" type="text" class="input input-sm w-full" placeholder="PRC-VET-XXXXX" required />
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="d_phone">Phone</label>
					<input id="d_phone" name="phone" type="text" class="input input-sm w-full" placeholder="09XX-XXX-XXXX" />
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="d_spec">Specialization</label>
					<select id="d_spec" name="specialization" class="select select-sm w-full">
						{#each specializations as s}
							<option value={s} class="capitalize">{s.replace(/-/g,' ')}</option>
						{/each}
					</select>
				</fieldset>
				<fieldset class="fieldset col-span-2">
					<label class="label" for="d_bio">Bio / Notes</label>
					<textarea id="d_bio" name="bio" class="textarea textarea-sm w-full" rows="2" placeholder="Short bio..."></textarea>
				</fieldset>
				<div class="modal-action col-span-2">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Add Doctor</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}

<!-- Notification config modal -->
{#if show_notify_modal && notify_target}
	<div class="modal modal-open">
		<div class="modal-box max-w-sm">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-base font-bold">Notification Settings</h3>
				<button onclick={() => { show_notify_modal = false; notify_target = null; }} class="btn btn-ghost btn-sm btn-circle">
					<X class="size-4" />
				</button>
			</div>
			<p class="text-sm text-base-content/60 mb-4">Dr. {notify_target.firstname} {notify_target.lastname}</p>
			<form method="POST" action="?/update_notifications" use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') toast.success('Notification preferences saved.');
					if (result.type === 'failure') toast.error('Failed to save preferences.');
					await update({ reset: result.type === 'success' });
					if (result.type === 'success') { show_notify_modal = false; notify_target = null; }
				};
			}} class="flex flex-col gap-3">
				<input type="hidden" name="id" value={notify_target._id} />

				{#each [
					{ name: 'notify_appointments', label: 'Appointment notifications',  checked: notify_target.notify_appointments },
					{ name: 'notify_surgeries',    label: 'Surgery notifications',      checked: notify_target.notify_surgeries },
					{ name: 'notify_lab_results',  label: 'Lab result notifications',   checked: notify_target.notify_lab_results },
					{ name: 'notify_admissions',   label: 'Hospitalization admissions', checked: notify_target.notify_admissions }
				] as pref}
					<label class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-base-content/[0.08] px-4 py-3 hover:bg-base-200/60 transition-colors">
						<span class="text-sm font-medium text-base-content/80">{pref.label}</span>
						<input type="checkbox" name={pref.name} class="toggle toggle-sm toggle-primary"
							checked={pref.checked} />
					</label>
				{/each}

				<div class="modal-action">
					<button type="button" onclick={() => { show_notify_modal = false; notify_target = null; }} class="btn btn-ghost btn-sm">Cancel</button>
					<button type="submit" class="btn btn-primary btn-sm">Save</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => { show_notify_modal = false; notify_target = null; }}></div>
	</div>
{/if}
