<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import type { Component } from 'svelte';
	import {
		ChartNoAxesCombined, ClipboardClock, ClipboardPenLine,
		FlaskConical, Hospital, LayoutDashboard, Package, PawPrint,
		ShoppingBasket, Slice, Syringe, Users, Sun, Moon, Activity,
		Settings, ScrollText,
		type IconProps
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import KeyboardShortcuts from '$lib/components/ui/KeyboardShortcuts.svelte';
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import { resolve } from '$app/paths';
	import { theme } from '$lib/stores/theme.svelte';

	let { children } = $props();

	type NavItem = {
		name: string;
		Icon?: Component<IconProps>;
		href?: string;
		sub_items?: NavItem[];
	};

	const nav: NavItem[] = [
		{ name: 'Dashboard',    Icon: LayoutDashboard, href: '/u/dashboard' },
		{ name: 'Customers',    Icon: Users,            href: '/u/customers' },
		{ name: 'Animals',      Icon: PawPrint,         href: '/u/animals' },
		{ name: 'Appointments', Icon: ClipboardClock,   href: '/u/appointments' },
		{
			name: 'Services',
			sub_items: [
				{ name: 'Consultations',   Icon: ClipboardPenLine, href: '/u/consultations' },
				{ name: 'Vaccinations',    Icon: Syringe,          href: '/u/vaccinations' },
				{ name: 'Laboratory',      Icon: FlaskConical,     href: '/u/laboratory' },
				{ name: 'Surgery',         Icon: Slice,            href: '/u/surgery' },
				{ name: 'Hospitalization', Icon: Hospital,         href: '/u/hospitalization' }
			]
		},
		{
			name: 'Sales',
			sub_items: [
				{ name: 'Billing',   Icon: ShoppingBasket,      href: '/u/billing' },
				{ name: 'Inventory', Icon: Package,             href: '/u/inventory' },
				{ name: 'Sales',     Icon: ChartNoAxesCombined, href: '/u/sales' }
			]
		},
		{
			name: 'Admin',
			sub_items: [
				{ name: 'Activity Log', Icon: ScrollText, href: '/u/activity-log' },
				{ name: 'Settings',     Icon: Settings,   href: '/u/settings' }
			]
		}
	];

	function isActive(href: string) {
		return page.url.pathname.startsWith(href);
	}

	const current_page = $derived(() => {
		for (const item of nav) {
			if (item.href && isActive(item.href)) return item.name;
			if (item.sub_items) {
				for (const sub of item.sub_items) {
					if (sub.href && isActive(sub.href)) return sub.name;
				}
			}
		}
		return 'EasyVet';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>EasyVet</title>
</svelte:head>

<div class="flex h-dvh w-full overflow-hidden bg-base-200">

	<!-- Sidebar -->
	<aside class="ev-sidebar ev-fade-in">
		<!-- Logo -->
		<div class="ev-sidebar-logo">
			<div class="ev-sidebar-logo-mark">
				<Activity class="size-4" strokeWidth={2.5} />
			</div>
			<div class="ev-sidebar-logo-text">
				<p class="text-sm font-bold leading-tight tracking-tight text-base-content">EasyVet</p>
				<p class="text-[0.6rem] text-base-content/38 leading-tight">Vet Management</p>
			</div>
		</div>

		<!-- Nav -->
		<nav class="ev-sidebar-nav">
			{#each nav as item, i}
				{#if !item.sub_items}
					<a
						href={resolve(item.href!)}
						class="ev-nav-link {item.href && isActive(item.href) ? 'ev-active' : ''} ev-slide-right"
						style="animation-delay:{i * 0.035}s"
					>
						{#if item.Icon}
							<item.Icon class="ev-nav-link-icon" strokeWidth={1.75} />
						{/if}
						<span>{item.name}</span>
					</a>
				{:else}
					<div class="ev-nav-section-label">{item.name}</div>
					{#each item.sub_items as sub, j}
						<a
							href={resolve(sub.href!)}
							class="ev-nav-link {sub.href && isActive(sub.href) ? 'ev-active' : ''} ev-slide-right"
							style="animation-delay:{(i + j) * 0.03}s"
						>
							{#if sub.Icon}
								<sub.Icon class="ev-nav-link-icon" strokeWidth={1.75} />
							{/if}
							<span>{sub.name}</span>
						</a>
					{/each}
				{/if}
			{/each}
		</nav>

		<!-- Bottom: theme toggle -->
		<div class="flex items-center justify-between border-t border-base-content/[0.07] px-4 py-3">
			<span class="text-[0.6rem] font-semibold text-base-content/30 uppercase tracking-wider ev-sidebar-logo-text">
				{theme.isDark ? 'Dark Mode' : 'Light Mode'}
			</span>
			<button
				class="ev-theme-toggle"
				onclick={() => theme.toggle()}
				title={theme.isDark ? 'Switch to Nord (light)' : 'Switch to Dark'}
				aria-label="Toggle theme"
			>
				{#if theme.isDark}
					<Sun class="size-3.5" strokeWidth={2} />
				{:else}
					<Moon class="size-3.5" strokeWidth={2} />
				{/if}
			</button>
		</div>
	</aside>

	<!-- Main -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<!-- Topbar -->
		<header class="ev-topbar">
			<span class="text-xs font-semibold text-base-content/38 uppercase tracking-widest">
				{current_page()}
			</span>
			<div class="flex items-center gap-2">
				<KeyboardShortcuts />
			<div class="flex items-center gap-2 rounded-lg border border-base-content/10 bg-base-200/60 px-2.5 py-1.5">
					<div class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-content">
						V
					</div>
					<span class="text-xs font-medium text-base-content/65">Dr. Vet</span>
				</div>
			</div>
		</header>

		<!-- Page -->
		<main class="min-h-0 flex-1 overflow-y-auto">
			<div class="h-full">{@render children()}</div>
		</main>
	</div>
</div>
