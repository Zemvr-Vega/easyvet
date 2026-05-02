<script lang="ts">
	import { enhance } from '$app/forms';
	import { Bell, Mail, TriangleAlert, CalendarCheck, ReceiptText, Info } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pref_rows = [
		{ key: 'notify_email',        label: 'Email notifications enabled', Icon: Mail,           desc: 'Master switch — disabling this stops all email from this user.' },
		{ key: 'notify_appointments', label: 'Appointment reminders',        Icon: CalendarCheck,  desc: 'Receive email when appointments are scheduled or updated.' },
		{ key: 'notify_low_stock',    label: 'Low stock alerts',             Icon: TriangleAlert,  desc: 'Receive email when inventory items fall below their reorder level.' },
		{ key: 'notify_billing',      label: 'Billing notifications',        Icon: ReceiptText,    desc: 'Receive email when invoices are created or paid.' }
	];
</script>

<div class="flex flex-col gap-6 max-w-2xl">

	<!-- SMTP status hint -->
	<div class="flex items-start gap-3 rounded-xl border border-info/20 bg-info/8 p-4">
		<Info class="size-4 text-info mt-0.5 flex-shrink-0" strokeWidth={2} />
		<div>
			<p class="text-sm font-semibold text-base-content">SMTP Configuration</p>
			<p class="text-xs text-base-content/60 mt-0.5 leading-relaxed">
				Email sending requires <code class="bg-base-300 px-1 rounded text-xs">SMTP_HOST</code>,
				<code class="bg-base-300 px-1 rounded text-xs">SMTP_USER</code>, and
				<code class="bg-base-300 px-1 rounded text-xs">SMTP_PASS</code> in your <code class="bg-base-300 px-1 rounded text-xs">.env</code> file.
				Without these, emails are logged to the console (dev mode).
				Run <code class="bg-base-300 px-1 rounded text-xs">npm install nodemailer</code> to enable sending.
			</p>
		</div>
	</div>

	<!-- Per-user notification preferences -->
	{#if data.admin_users.length === 0}
		<div class="ev-panel p-8 text-center">
			<Bell class="size-10 mx-auto mb-3 text-base-content/20" />
			<p class="text-sm font-medium text-base-content/50">No admin users found.</p>
			<p class="text-xs text-base-content/35 mt-1">Add admin users in the Users tab to configure notifications.</p>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.admin_users as user}
				<div class="ev-panel p-5">
					<div class="flex items-center gap-3 mb-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
							{user.firstname[0]}{user.lastname[0]}
						</div>
						<div>
							<p class="text-sm font-bold text-base-content">{user.firstname} {user.lastname}</p>
							<p class="text-xs text-base-content/45">{user.email}</p>
						</div>
					</div>

					<form method="POST" action="?/update_user_prefs" use:enhance class="flex flex-col gap-2">
						<input type="hidden" name="id" value={user._id} />
						{#each pref_rows as pref}
							<label class="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-base-content/[0.07] px-4 py-3 hover:bg-base-200/50 transition-colors">
								<div class="flex items-center gap-2.5">
									<pref.Icon class="size-4 text-base-content/40" strokeWidth={1.75} />
									<div>
										<p class="text-sm font-medium text-base-content/85">{pref.label}</p>
										<p class="text-xs text-base-content/40">{pref.desc}</p>
									</div>
								</div>
								<input
									type="checkbox"
									name={pref.key}
									class="toggle toggle-sm toggle-primary"
									checked={user[pref.key as keyof typeof user] as boolean}
									onchange={(e) => e.currentTarget.closest('form')?.requestSubmit()}
								/>
							</label>
						{/each}
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>
