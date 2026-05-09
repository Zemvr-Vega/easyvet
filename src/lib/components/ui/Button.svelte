<script lang="ts">
	import type { Snippet } from 'svelte';
	import { LoaderCircle } from '@lucide/svelte';

	type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'soft' | 'outline' | 'error' | 'success' | 'warning' | 'info' | 'neutral';
	type Size    = 'xs' | 'sm' | 'md' | 'lg';

	type Props = {
		variant?:  Variant;
		size?:     Size;
		loading?:  boolean;
		disabled?: boolean;
		type?:     'button' | 'submit' | 'reset';
		href?:     string;
		tip?:      string;
		wide?:     boolean;
		circle?:   boolean;
		class?:    string;
		onclick?:  (e: MouseEvent) => void;
		children:  Snippet;
	};

	let {
		variant  = 'primary',
		size     = 'sm',
		loading  = false,
		disabled = false,
		type     = 'button',
		href,
		tip,
		wide     = false,
		circle   = false,
		class: cls = '',
		onclick,
		children
	}: Props = $props();

	const variant_map: Record<Variant, string> = {
		primary:   'btn-primary',
		secondary: 'btn-secondary',
		accent:    'btn-accent',
		ghost:     'btn-ghost',
		soft:      'btn-soft btn-primary',
		outline:   'btn-outline',
		error:     'btn-error',
		success:   'btn-success',
		warning:   'btn-warning',
		info:      'btn-info',
		neutral:   'btn-neutral'
	};

	const size_map: Record<Size, string> = {
		xs: 'btn-xs', sm: 'btn-sm', md: '', lg: 'btn-lg'
	};

	const classes = $derived(
		['btn', variant_map[variant], size_map[size],
		 wide ? 'btn-wide' : '', circle ? 'btn-circle' : '',
		 loading ? 'pointer-events-none' : '', cls
		].filter(Boolean).join(' ')
	);
</script>

{#if href && !disabled}
	<a {href} class={classes} title={tip} aria-label={tip}>
		{#if loading}<LoaderCircle class="size-3.5 animate-spin" />{/if}
		{@render children()}
	</a>
{:else}
	<button {type} class={classes} disabled={disabled || loading} title={tip} aria-label={tip} {onclick}>
		{#if loading}<LoaderCircle class="size-3.5 animate-spin" />{/if}
		{@render children()}
	</button>
{/if}
