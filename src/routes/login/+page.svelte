<script lang="ts">
	import { enhance } from '$app/forms';
	import { Activity, Eye, EyeOff, Lock, Mail } from '@lucide/svelte';
	import type { ActionData } from './$types';
	import { theme } from '$lib/stores/theme.svelte';

	let { form }: { form: ActionData } = $props();

	let show_pw   = $state(false);
	let loading   = $state(false);
</script>

<svelte:head><title>EasyVet — Sign In</title></svelte:head>

<div class="flex h-dvh w-full overflow-hidden">
	<!-- Left — branding panel -->
	<div class="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col items-center justify-center bg-primary p-12 relative overflow-hidden">
		<!-- Background pattern -->
		<div class="absolute inset-0 opacity-10">
			{#each Array(20) as _, i}
				<div
					class="absolute rounded-full border border-white/30"
					style="
						width: {80 + i * 40}px; height: {80 + i * 40}px;
						top: 50%; left: 50%;
						transform: translate(-50%, -50%);
						animation: pulse {2 + i * 0.2}s ease-in-out infinite alternate;
					"
				></div>
			{/each}
		</div>

		<div class="relative z-10 text-center text-primary-content">
			<div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm mx-auto mb-6 shadow-lg">
				<Activity class="size-10 text-white" strokeWidth={2} />
			</div>
			<h1 class="text-4xl font-bold tracking-tight mb-3">EasyVet</h1>
			<p class="text-lg text-white/75 font-medium mb-8">Veterinary Management System</p>

			<div class="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto">
				{#each [
					{ icon: '🐾', title: 'Patient Records', desc: 'Complete medical history' },
					{ icon: '💊', title: 'Inventory',       desc: 'Smart stock alerts' },
					{ icon: '📅', title: 'Appointments',    desc: 'Schedule & reminders' },
					{ icon: '📊', title: 'Analytics',       desc: 'Revenue & reports' }
				] as feature}
					<div class="rounded-xl bg-white/10 backdrop-blur-sm p-3.5">
						<p class="text-xl mb-1">{feature.icon}</p>
						<p class="text-sm font-semibold text-white">{feature.title}</p>
						<p class="text-xs text-white/60">{feature.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Right — login form -->
	<div class="flex flex-1 flex-col items-center justify-center bg-base-100 p-8">
		<!-- Theme toggle top right -->
		<div class="absolute top-4 right-4">
			<button
				class="ev-theme-toggle"
				onclick={() => theme.toggle()}
				aria-label="Toggle theme"
			>
				{#if theme.isDark}
					<!-- Sun icon inline -->
					<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/>
						<line x1="12" y1="18" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/>
						<line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="6" y2="12"/>
						<line x1="18" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/>
						<line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/>
					</svg>
				{:else}
					<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				{/if}
			</button>
		</div>

		<div class="w-full max-w-sm">
			<!-- Mobile logo -->
			<div class="flex lg:hidden items-center gap-3 mb-8">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
					<Activity class="size-5 text-primary-content" strokeWidth={2.5} />
				</div>
				<div>
					<p class="text-lg font-bold text-base-content">EasyVet</p>
					<p class="text-xs text-base-content/45">Vet Management System</p>
				</div>
			</div>

			<h2 class="text-2xl font-bold text-base-content mb-1">Welcome back</h2>
			<p class="text-sm text-base-content/50 mb-8">Sign in to your account to continue</p>

			<!-- Error alert -->
			{#if form?.error}
				<div class="alert alert-error mb-5 py-2.5 text-sm">
					<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
						<line x1="12" y1="16" x2="12.01" y2="16"/>
					</svg>
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				novalidate
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<!-- Email -->
				<fieldset class="fieldset">
					<label class="label" for="login_email">Email Address</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/35 pointer-events-none" />
						<input
							id="login_email"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="you@clinic.com"
							class="input input-sm w-full pl-9"
							required
						/>
					</div>
				</fieldset>

				<!-- Password -->
				<fieldset class="fieldset">
					<div class="flex items-center justify-between mb-0.5">
						<label class="label !pb-0" for="login_password">Password</label>
						<a href="/forgot-password" class="text-xs text-primary hover:underline">Forgot password?</a>
					</div>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/35 pointer-events-none" />
						<input
							id="login_password"
							name="password"
							type={show_pw ? 'text' : 'password'}
							autocomplete="current-password"
							placeholder="••••••••"
							class="input input-sm w-full pl-9 pr-10"
							required
						/>
						<button
							type="button"
							class="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/35 hover:text-base-content/70 transition-colors"
							onclick={() => (show_pw = !show_pw)}
							aria-label={show_pw ? 'Hide password' : 'Show password'}
						>
							{#if show_pw}
								<EyeOff class="size-4" />
							{:else}
								<Eye class="size-4" />
							{/if}
						</button>
					</div>
				</fieldset>

				<button
					type="submit"
					class="btn btn-primary btn-sm w-full mt-1 gap-2"
					disabled={loading}
				>
					{#if loading}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					{loading ? 'Signing in…' : 'Sign In'}
				</button>
			</form>

			<!-- Demo hint -->
			<div class="mt-6 rounded-xl border border-base-content/[0.07] bg-base-200/60 p-4">
				<p class="text-xs font-semibold text-base-content/60 mb-2">Demo Credentials</p>
				<div class="space-y-1 text-xs text-base-content/50">
					<p>First, create an admin user in <strong class="text-base-content/70">Settings → Users</strong></p>
					<p>Default password: <code class="bg-base-300 px-1.5 py-0.5 rounded font-mono">password</code></p>
				</div>
			</div>
		</div>
	</div>
</div>
