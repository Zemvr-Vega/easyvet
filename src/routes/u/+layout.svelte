<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import type { Component } from 'svelte';
	import {
		ChartNoAxesCombined,
		ClipboardClock,
		ClipboardPenLine,
		FlaskConical,
		Hospital,
		LayoutDashboard,
		Package,
		ShoppingBasket,
		Slice,
		Syringe,
		Users,
		type IconProps
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();

	type DrawerItem = {
		name: string;
		Icon?: Component<IconProps>;
		href?: string;
		sub_items?: DrawerItem[];
	};

	let drawer_items: DrawerItem[] = [
		{
			name: 'Dashboard',
			Icon: LayoutDashboard,
			href: '/u/dashboard'
		},
		{
			name: 'Customers',
			Icon: Users,
			href: '/u/customers'
		},
		{
			name: 'Appointments',
			Icon: ClipboardClock,
			href: '/u/appointments'
		},
		{
			name: 'Services',
			sub_items: [
				{
					name: 'Consultations',
					Icon: ClipboardPenLine,
					href: '/u/consultations'
				},
				{
					name: 'Vaccinations',
					Icon: Syringe,
					href: '/u/vaccinations'
				},
				{
					name: 'Laboratory',
					Icon: FlaskConical,
					href: '/u/laboratory'
				},
				{
					name: 'Surgery',
					Icon: Slice,
					href: '/u/surgery'
				},
				{
					name: 'Hospitalization',
					Icon: Hospital,
					href: '/u/hospitalization'
				}
			]
		},
		{
			name: 'Sales',
			sub_items: [
				{
					name: 'Point of Sale',
					Icon: ShoppingBasket,
					href: '/u/point-of-sale'
				},
				{
					name: 'Inventory',
					Icon: Package,
					href: '/u/inventory'
				},
				{
					name: 'Sales',
					Icon: ChartNoAxesCombined,
					href: '/u/sales'
				}
			]
		}
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>EasyVet</title>
</svelte:head>

<div class="flex h-dvh w-full flex-row bg-base-200">
	<aside class="bg flex h-dvh w-fit flex-col">
		<div class="flex flex-row items-center gap-2 p-4 text-sm font-semibold">
			<p>EasyVet</p>
		</div>

		<ul class="menu min-h-0 w-48 grow overflow-auto">
			{#each drawer_items as { name, Icon, href, sub_items }, index (index)}
				{#if !sub_items?.length}
					<li>
						<a
							href={resolve(href)}
							class={[
								'text-xs font-semibold',
								href && page.url.pathname.startsWith(href) && 'bg-primary text-primary-content'
							]}
						>
							{#if Icon}
								<Icon class="size-4 stroke-1" />
							{/if}
							{name}
						</a>
					</li>
				{:else}
					<li>
						<span class="pointer-events-none text-xs">{name}</span>
						<ul>
							{#each sub_items as i, index (index)}
								<li>
									<a
										href={i.href}
										class={[
											'text-xs font-semibold',
											i.href &&
												page.url.pathname.startsWith(i.href) &&
												'bg-primary text-primary-content'
										]}
										>{#if i.Icon}
											<i.Icon class="size-4 stroke-1" />
										{/if}{i.name}</a
									>
								</li>
							{/each}
						</ul>
					</li>
				{/if}
			{/each}
		</ul>
	</aside>

	<div class="flex h-dvh max-h-dvh min-h-0 w-full grow flex-col gap-4 overflow-auto p-4">
		{@render children()}
	</div>
</div>
