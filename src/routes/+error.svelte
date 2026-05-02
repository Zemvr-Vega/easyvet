<script lang="ts">
	import { page } from '$app/state';
	import { ShieldAlert, Clock, TriangleAlert, Home } from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'An unexpected error occurred.');

	type ErrorConfig = {
		Icon: Component<IconProps>;
		color: string;
		bg: string;
		border: string;
		title: string;
		description: string;
		badge: string;
	};

	const config = $derived((): ErrorConfig => {
		if (status === 429) {
			return {
				Icon: Clock,
				color: 'text-warning',
				bg: 'bg-warning/10',
				border: 'border-warning/20',
				title: 'Too Many Requests',
				description: 'You have sent too many requests in a short period. Please wait a moment before trying again.',
				badge: '429'
			};
		}
		if (status === 401) {
			return {
				Icon: ShieldAlert,
				color: 'text-error',
				bg: 'bg-error/10',
				border: 'border-error/20',
				title: 'Unauthorized',
				description: 'You do not have permission to access this resource.',
				badge: '401'
			};
		}
		if (status === 403) {
			return {
				Icon: ShieldAlert,
				color: 'text-error',
				bg: 'bg-error/10',
				border: 'border-error/20',
				title: 'Forbidden',
				description: 'You do not have permission to access this resource.',
				badge: '403'
			};
		}
		if (status === 404) {
			return {
				Icon: TriangleAlert,
				color: 'text-info',
				bg: 'bg-info/10',
				border: 'border-info/20',
				title: 'Page Not Found',
				description: 'The page you are looking for does not exist or has been moved.',
				badge: '404'
			};
		}
		return {
			Icon: TriangleAlert,
			color: 'text-error',
			bg: 'bg-error/10',
			border: 'border-error/20',
			title: 'Something Went Wrong',
			description: message,
			badge: String(status)
		};
	});

	// Destructure into a plain variable so Svelte can use it as a component tag
	const ErrorIcon = $derived(config().Icon);
	const errorColor = $derived(config().color);
	const errorBg = $derived(config().bg);
	const errorBorder = $derived(config().border);
	const errorTitle = $derived(config().title);
	const errorDescription = $derived(config().description);
	const errorBadge = $derived(config().badge);
</script>

<div class="flex h-dvh w-full items-center justify-center bg-base-200 p-6">
	<div class="w-full max-w-md text-center">

		<!-- Icon card -->
		<div class="inline-flex items-center justify-center rounded-2xl border p-5 mb-6 {errorBg} {errorBorder}">
			<ErrorIcon class="size-10 {errorColor}" strokeWidth={1.5} />
		</div>

		<!-- Status badge -->
		<div class="mb-3">
			<span class="badge badge-ghost badge-lg font-mono text-base-content/50">
				{errorBadge}
			</span>
		</div>

		<h1 class="text-2xl font-bold text-base-content mb-2">{errorTitle}</h1>
		<p class="text-sm text-base-content/55 mb-8 leading-relaxed max-w-sm mx-auto">
			{errorDescription}
		</p>

		<!-- Actions -->
		<div class="flex items-center justify-center gap-3">
			{#if status === 429}
				<button
					class="btn btn-primary btn-sm gap-1.5"
					onclick={() => { setTimeout(() => location.reload(), 100); }}
				>
					<Clock class="size-3.5" /> Try Again
				</button>
			{/if}
			<a href="/u/dashboard" class="btn btn-ghost btn-sm gap-1.5">
				<Home class="size-3.5" /> Dashboard
			</a>
		</div>

		<!-- Dev hint for 429 -->
		{#if status === 429}
			<p class="mt-6 text-[0.65rem] text-base-content/25 font-mono">
				Rate limit exceeded. Check X-RateLimit-Reset header for reset time.
			</p>
		{/if}
	</div>
</div>
