<script lang="ts">
	import type { Input } from './Input';

	let {
		style,
		name,
		label,
		placeholder = `Enter ${label.toLowerCase()}`,
		errors,
		children,
		value = $bindable(),
		constraints,
		required = false
	}: Input = $props();
</script>

<fieldset class="fieldset w-full gap-0.5">
	<legend class="fieldset-legend p-0.5">
		{#if required}
			<span class="text-error">*</span>
		{/if}
		<span>{label}</span>
	</legend>

	<input
		type="date"
		{placeholder}
		{name}
		class={['input input-sm w-full', style, errors && errors.length ? 'border-error' : '']}
		aria-invalid={errors ? true : undefined}
		bind:value
		{...constraints}
	/>

	{#if children}
		{@render children()}
	{/if}
</fieldset>
