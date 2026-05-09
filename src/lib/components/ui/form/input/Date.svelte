<script lang="ts">
	import type { Input } from './Input';

	let {
		style,
		name,
		label,
		errors,
		value = $bindable(),
		constraints,
		children,
		required = false
	}: Input = $props();

	const has_error = $derived(!!(errors && errors.length));
</script>

<fieldset class="fieldset w-full">
	<label class="label" for={name}>
		{#if required}<span class="text-error mr-0.5">*</span>{/if}
		<span>{label}</span>
	</label>
	<input
		id={name}
		type="date"
		{name}
		class={['input input-sm w-full', style, has_error ? 'input-error' : ''].filter(Boolean).join(' ')}
		aria-invalid={has_error || undefined}
		bind:value
		{...constraints}
	/>
	{#if has_error}
		<p class="label text-error text-xs mt-0.5">{Array.isArray(errors) ? errors[0] : errors}</p>
	{/if}
	{#if children}{@render children()}{/if}
</fieldset>
