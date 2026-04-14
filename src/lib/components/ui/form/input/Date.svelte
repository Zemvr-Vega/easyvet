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
	<!-- label -->
	<legend class="fieldset-legend p-0.5">
		{#if required}
			<span class="text-error">*</span>
		{/if}
		<span>{label}</span>
	</legend>

	<!-- input -->
	<input
		type="date"
		{placeholder}
		{name}
		class={['input', style, errors && errors.length && 'border-error']}
		aria-invalid={errors ? true : undefined}
		bind:value
		{...constraints}
	/>

	<!-- children props such as errors and other info will be rendered here -->
	{#if children}
		{@render children()}
	{/if}
</fieldset>
