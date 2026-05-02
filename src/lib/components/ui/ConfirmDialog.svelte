<script lang="ts">
	import { TriangleAlert, X } from '@lucide/svelte';

	type Props = {
		title?:       string;
		message:      string;
		confirm_text?: string;
		cancel_text?:  string;
		variant?:     'error' | 'warning' | 'info';
		open:         boolean;
		onconfirm:    () => void;
		oncancel:     () => void;
	};

	let {
		title        = 'Are you sure?',
		message,
		confirm_text = 'Confirm',
		cancel_text  = 'Cancel',
		variant      = 'warning',
		open         = $bindable(),
		onconfirm,
		oncancel
	}: Props = $props();

	const color: Record<string, string> = {
		error:   'text-error',
		warning: 'text-warning',
		info:    'text-info'
	};
	const btn_variant: Record<string, string> = {
		error:   'btn-error',
		warning: 'btn-warning',
		info:    'btn-primary'
	};

	function confirm() {
		open = false;
		onconfirm();
	}
	function cancel() {
		open = false;
		oncancel?.();
	}
</script>

{#if open}
	<div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
		<div class="modal-box max-w-sm ev-scale-in">
			<div class="flex items-start gap-3 mb-1">
				<div class="rounded-full p-1.5 bg-{variant}/10 mt-0.5 flex-shrink-0">
					<TriangleAlert class="size-4 {color[variant]}" strokeWidth={2} />
				</div>
				<div class="flex-1">
					<h3 id="confirm-title" class="font-bold text-base-content">{title}</h3>
					<p class="text-sm text-base-content/60 mt-1 leading-relaxed">{message}</p>
				</div>
				<button onclick={cancel} class="btn btn-ghost btn-xs btn-circle ml-1 flex-shrink-0">
					<X class="size-3.5" />
				</button>
			</div>
			<div class="modal-action mt-4">
				<button onclick={cancel} class="btn btn-ghost btn-sm">{cancel_text}</button>
				<button onclick={confirm} class="btn btn-sm {btn_variant[variant]}">{confirm_text}</button>
			</div>
		</div>
		<div class="modal-backdrop" onclick={cancel}></div>
	</div>
{/if}
