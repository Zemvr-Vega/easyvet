<script lang="ts">
	import { Info } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		tip: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		icon?: boolean; // show the ? icon instead of wrapping children
		children?: Snippet;
		class?: string;
	};

	let { tip, position = 'top', icon = true, children, class: cls = '' }: Props = $props();

	const pos_class: Record<string, string> = {
		top: 'tooltip-top',
		bottom: 'tooltip-bottom',
		left: 'tooltip-left',
		right: 'tooltip-right'
	};
</script>

<span class="tooltip {pos_class[position]} {cls}" data-tip={tip} role="tooltip" aria-label={tip}>
	{#if icon}
		<span class="inline-flex cursor-help items-center">
			<Info
				class="size-3.5 text-base-content/35 transition-colors hover:text-base-content/70"
				strokeWidth={2}
			/>
		</span>
	{:else if children}
		{@render children()}
	{/if}
</span>
