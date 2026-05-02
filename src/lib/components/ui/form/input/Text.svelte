<script lang="ts">
	import type { Input } from './Input';

	let {
		style,
		name,
		label,
		placeholder = `Enter ${label.toLowerCase()}`,
		errors,
		value = $bindable(),
		constraints,
		children,
		required = false
	}: Input = $props();
</script>

<fieldset class="fieldset w-full gap-0.5">
	<legend class="fieldset-legend p-0.5">
		<span>{label}</span>
		{#if required}
			<span class="text-error">*</span>
		{/if}
	</legend>

	<input
		type="text"
		{placeholder}
		{name}
		class={['input input-sm w-full', style, errors && errors.length ? 'border-error' : '']}
		aria-invalid={errors ? true : undefined}
		{...constraints}
		bind:value
	/>

	{#if children}
		{@render children()}
	{/if}
</fieldset>
