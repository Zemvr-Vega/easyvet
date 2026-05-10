<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { CirclePlus, X, Users, Search } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let show_modal = $state(false);
	let search_input = $state(data.search);

	const roles = ['admin', 'veterinarian', 'receptionist', 'technician', 'viewer'];
	const statuses = ['active', 'inactive', 'suspended'];

	const role_badge: Record<string, string> = {
		admin: 'badge-error',
		veterinarian: 'badge-primary',
		receptionist: 'badge-success',
		technician: 'badge-info',
		viewer: 'badge-ghost'
	};
	const status_badge: Record<string, string> = {
		active: 'badge-success',
		inactive: 'badge-ghost',
		suspended: 'badge-error'
	};

	function doSearch() {
		const p = new URLSearchParams();
		if (search_input) p.set('q', search_input);
		p.set('page', '1');
		p.set('size', String(data.size));
		goto(`/u/settings/users?${p}`);
	}
</script>

<div class="flex h-full flex-col gap-4 p-5">
	<!-- Toolbar -->
	<div class="flex items-center justify-between">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				doSearch();
			}}
			class="flex items-center gap-2"
		>
			<div class="ev-search-wrap w-52">
				<Search />
				<input
					type="text"
					class="ev-search"
					placeholder="Search users..."
					bind:value={search_input}
				/>
			</div>
			<button type="submit" class="btn text-xs btn-ghost btn-sm">Search</button>
		</form>
		<button class="btn gap-1.5 btn-sm btn-primary" onclick={() => (show_modal = true)}>
			<CirclePlus class="size-3.5" strokeWidth={2.5} /> Add User
		</button>
	</div>

	<!-- Table -->
	<div class="ev-panel flex min-h-0 flex-1 flex-col overflow-hidden">
		<div class="min-h-0 flex-1 overflow-y-auto">
			<table class="ev-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Phone</th>
						<th>Role</th>
						<th>Status</th>
						<th>Last Login</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user}
						<tr>
							<td>
								<div class="flex items-center gap-2.5">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
									>
										{user.firstname[0]}{user.lastname[0]}
									</div>
									<p class="text-sm font-semibold text-base-content">
										{user.firstname}
										{user.lastname}
									</p>
								</div>
							</td>
							<td class="text-xs text-base-content/60">{user.email}</td>
							<td class="text-xs text-base-content/60">{user.phone || '—'}</td>
							<td>
								<span class="badge badge-xs {role_badge[user.role] ?? 'badge-ghost'} capitalize"
									>{user.role}</span
								>
							</td>
							<td>
								<span class="badge badge-xs {status_badge[user.status]} capitalize"
									>{user.status}</span
								>
							</td>
							<td class="text-xs text-base-content/40">
								{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
							</td>
							<td>
								<div class="flex items-center gap-1">
									<!-- Role change -->
									<form method="POST" action="?/update_role" use:enhance>
										<input type="hidden" name="id" value={user._id} />
										<select
											name="role"
											class="select select-xs"
											onchange={(e) => e.currentTarget.form?.requestSubmit()}
										>
											{#each roles as r}
												<option value={r} selected={user.role === r} class="capitalize">{r}</option>
											{/each}
										</select>
									</form>
									<!-- Status change -->
									<form method="POST" action="?/update_status" use:enhance>
										<input type="hidden" name="id" value={user._id} />
										<select
											name="status"
											class="select select-xs"
											onchange={(e) => e.currentTarget.form?.requestSubmit()}
										>
											{#each statuses as s}
												<option value={s} selected={user.status === s} class="capitalize"
													>{s}</option
												>
											{/each}
										</select>
									</form>
									<!-- Archive -->
									<form method="POST" action="?/archive" use:enhance>
										<input type="hidden" name="id" value={user._id} />
										<button
											type="submit"
											class="btn text-error/60 btn-ghost btn-xs hover:text-error"
											onclick={(e) => {
												if (!confirm(`Archive ${user.firstname}?`)) e.preventDefault();
											}}
										>
											<X class="size-3" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr
							><td colspan="7">
								<div class="ev-empty">
									<Users class="size-8" />
									<p class="text-sm font-medium">No users found</p>
								</div>
							</td></tr
						>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<Pagination total={data.total} />
</div>

<!-- Add User Modal -->
{#if show_modal}
	<div class="modal-open modal">
		<div class="modal-box max-w-md">
			<div class="mb-5 flex items-center justify-between">
				<h3 class="text-base font-bold">Add User</h3>
				<button onclick={() => (show_modal = false)} class="btn btn-circle btn-ghost btn-sm">
					<X class="size-4" />
				</button>
			</div>
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') toast.success('User created successfully.');
						if (result.type === 'failure') toast.error('Failed to create user.');
						await update({ reset: result.type === 'success' });
						if (result.type === 'success') {
							show_modal = false;
						}
					};
				}}
				class="grid grid-cols-2 gap-3"
			>
				<fieldset class="fieldset">
					<label class="label" for="firstname">First Name <span class="text-error">*</span></label>
					<input
						id="firstname"
						name="firstname"
						type="text"
						class="input input-sm w-full"
						placeholder="Juan"
						required
					/>
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="lastname">Last Name <span class="text-error">*</span></label>
					<input
						id="lastname"
						name="lastname"
						type="text"
						class="input input-sm w-full"
						placeholder="Dela Cruz"
						required
					/>
				</fieldset>
				<fieldset class="col-span-2 fieldset">
					<label class="label" for="email">Email Address <span class="text-error">*</span></label>
					<input
						id="email"
						name="email"
						type="email"
						class="input input-sm w-full"
						placeholder="user@easyvet.com"
						required
					/>
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="phone">Phone</label>
					<input
						id="phone"
						name="phone"
						type="text"
						class="input input-sm w-full"
						placeholder="09XX-XXX-XXXX"
					/>
				</fieldset>
				<fieldset class="fieldset">
					<label class="label" for="role">Role</label>
					<select id="role" name="role" class="select w-full select-sm">
						{#each roles as r}
							<option value={r} class="capitalize">{r}</option>
						{/each}
					</select>
				</fieldset>
				<p class="col-span-2 rounded-lg bg-base-200 px-3 py-2 text-xs text-base-content/40">
					A temporary password will be generated. The user must reset it on first login.
				</p>
				<div class="col-span-2 modal-action">
					<button type="button" onclick={() => (show_modal = false)} class="btn btn-ghost btn-sm"
						>Cancel</button
					>
					<button type="submit" class="btn btn-sm btn-primary">Create User</button>
				</div>
			</form>
		</div>
		<div class="modal-backdrop" onclick={() => (show_modal = false)}></div>
	</div>
{/if}
