<script lang="ts">
	import { goto } from '$app/navigation';
	import { X, Keyboard } from '@lucide/svelte';

	let show = $state(false);

	const shortcuts = [
		{ keys: ['G', 'D'],     label: 'Go to Dashboard',    action: () => goto('/u/dashboard') },
		{ keys: ['G', 'A'],     label: 'Go to Animals',       action: () => goto('/u/animals') },
		{ keys: ['G', 'C'],     label: 'Go to Customers',     action: () => goto('/u/customers') },
		{ keys: ['G', 'I'],     label: 'Go to Inventory',     action: () => goto('/u/inventory') },
		{ keys: ['G', 'B'],     label: 'Go to Billing',       action: () => goto('/u/billing') },
		{ keys: ['G', 'L'],     label: 'Go to Activity Log',  action: () => goto('/u/activity-log') },
		{ keys: ['?'],          label: 'Show this help panel', action: () => (show = true) }
	];

	let buf = $state('');
	let buf_timer: ReturnType<typeof setTimeout> | null = null;

	function handleKey(e: KeyboardEvent) {
		// Ignore when inside an input/textarea/select
		const tag = (e.target as HTMLElement)?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

		if (e.key === 'Escape') { show = false; return; }
		if (e.key === '?') { show = true; return; }

		buf += e.key.toUpperCase();
		if (buf_timer) clearTimeout(buf_timer);
		buf_timer = setTimeout(() => (buf = ''), 800);

		for (const s of shortcuts) {
			if (s.keys.join('') === buf) {
				buf = '';
				s.action();
				return;
			}
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

<!-- Trigger button in topbar (shown from layout) -->
<button
	class="ev-theme-toggle"
	onclick={() => (show = true)}
	title="Keyboard shortcuts (?)"
	aria-label="Show keyboard shortcuts"
>
	<Keyboard class="size-3.5" strokeWidth={2} />
</button>

<!-- Help modal -->
{#if show}
	<div class="modal modal-open" role="dialog" aria-modal="true">
		<div class="modal-box max-w-sm ev-scale-in">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-base font-bold text-base-content flex items-center gap-2">
					<Keyboard class="size-4 text-primary" />
					Keyboard Shortcuts
				</h3>
				<button onclick={() => (show = false)} class="btn btn-ghost btn-xs btn-circle">
					<X class="size-4" />
				</button>
			</div>

			<ul class="space-y-2">
				{#each shortcuts as s}
					<li class="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-base-200/60 transition-colors">
						<span class="text-sm text-base-content/75">{s.label}</span>
						<div class="flex items-center gap-1">
							{#each s.keys as key, i}
								{#if i > 0}<span class="text-xs text-base-content/30">then</span>{/if}
								<kbd class="kbd kbd-xs">{key}</kbd>
							{/each}
						</div>
					</li>
				{/each}
			</ul>

			<p class="mt-4 text-xs text-base-content/35 text-center">Press <kbd class="kbd kbd-xs">ESC</kbd> to close</p>
		</div>
		<div class="modal-backdrop" onclick={() => (show = false)}></div>
	</div>
{/if}
