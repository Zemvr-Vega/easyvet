<script lang="ts">
	import { resolve } from '$app/paths';
	import { Activity } from '@lucide/svelte';
</script>

<svelte:head><title>EasyVet — Veterinary Management System</title></svelte:head>

<div class="flex h-dvh w-full flex-col items-center justify-center bg-base-100 gap-8 p-8 text-center">
	<div class="flex flex-col items-center gap-4 ev-fade-up">
		<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
			<Activity class="size-8 text-primary-content" strokeWidth={2.5} />
		</div>
		<div>
			<h1 class="text-3xl font-bold text-base-content tracking-tight">EasyVet</h1>
			<p class="text-base-content/50 mt-1 text-sm">Veterinary Management System</p>
		</div>
	</div>

	<div class="flex flex-col items-center gap-3 ev-fade-up ev-d2">
		<a
			href={resolve('/login')}
			class="btn btn-primary btn-md w-48 shadow-sm"
		>
			Sign In
		</a>
		<a
			href={resolve('/u/dashboard')}
			class="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content"
		>
			Go to Dashboard →
		</a>
	</div>

	<p class="text-xs text-base-content/25 ev-fade-up ev-d3">
		v0.1.0 · Built with SvelteKit + MongoDB
	</p>
</div>
