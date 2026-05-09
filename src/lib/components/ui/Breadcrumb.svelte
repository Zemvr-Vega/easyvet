<script lang="ts">
	import { page } from '$app/state';
	import { ChevronRight, Home } from '@lucide/svelte';

	type Crumb = { label: string; href?: string };

	type Props = {
		crumbs?: Crumb[]; // manual override
	};

	let { crumbs }: Props = $props();

	// Auto-generate from pathname if no manual crumbs provided
	const auto_crumbs = $derived((): Crumb[] => {
		const parts = page.url.pathname.replace(/^\/u\//, '').split('/').filter(Boolean);
		const result: Crumb[] = [{ label: 'Home', href: '/u/dashboard' }];
		let path = '/u';
		for (const part of parts) {
			path += '/' + part;
			// humanize the segment
			const label = part
				.replace(/-/g, ' ')
				.replace(/\[|\]/g, '')
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (c) => c.toUpperCase());
			result.push({ label, href: path });
		}
		return result;
	});

	const display_crumbs = $derived(crumbs ?? auto_crumbs());
</script>

{#if display_crumbs.length > 1}
	<nav aria-label="Breadcrumb" class="breadcrumbs text-xs text-base-content/45 py-0">
		<ul>
			{#each display_crumbs as crumb, i}
				<li>
					{#if crumb.href && i < display_crumbs.length - 1}
						<a href={crumb.href} class="hover:text-primary transition-colors flex items-center gap-1">
							{#if i === 0}<Home class="size-3" />{/if}
							{crumb.label}
						</a>
					{:else}
						<span class="font-medium text-base-content/70">{crumb.label}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
{/if}
