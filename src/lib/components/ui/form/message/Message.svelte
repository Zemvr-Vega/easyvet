<script lang="ts">
	import { TriangleAlert, Info as InfoIcon, Check } from '@lucide/svelte';
	import type { Component, Snippet } from 'svelte';

	type ErrorProps = {
		children?: Snippet;
		message?: string | string[];
		type?: 'error' | 'info' | 'success';
	};
	const { children, message, type = 'error' }: ErrorProps = $props();
</script>

{#if children}
	{@render children()}
{:else if message}
	{#if type == 'error'}
		{@render Error(message)}
	{:else if type == 'info'}
		{@render Info(message)}
	{:else if type == 'success'}
		{@render Success(message)}
	{/if}
{/if}

{#snippet Error(message: string | string[])}
	{@render MessageTemplate('error', message, TriangleAlert)}
{/snippet}

{#snippet Info(message: string | string[])}
	{@render MessageTemplate('info', message, InfoIcon)}
{/snippet}

{#snippet Success(message: string | string[])}
	{@render MessageTemplate('success', message, Check)}
{/snippet}

{#snippet MessageTemplate(
	color: 'error' | 'info' | 'success',
	message: string | string[],
	Icon?: Component
)}
	<div
		class={[`text-xs text-${color} tooltip flex max-w-full flex-row items-center gap-1 truncate`]}
		title={Array.isArray(message) ? message[0] : message}
	>
		{#if Icon}
			<Icon class="size-3 min-h-3 min-w-3" />
		{/if}

		<span class="max-w-full truncate">
			{#if Array.isArray(message)}
				{message[0]}
			{:else}
				{message}
			{/if}
		</span>
	</div>
{/snippet}
