<script lang="ts">
	import { resolve } from '$app/paths';
	import { date } from '$lib/utils/helper';
	import { formatPHP } from '$lib/constants';
	import {
		PawPrint, Users, CalendarCheck, TrendingUp,
		TriangleAlert, ReceiptText, CirclePlus, ArrowUpRight
	} from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { stats, recent_animals, upcoming_appointments, species_breakdown, revenue_7d } = data;

	const species_emoji: Record<string, string> = {
		dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', reptile: '🦎', fish: '🐟', other: '🐾'
	};

	const total_species = species_breakdown.reduce((s: number, x: { count: number }) => s + x.count, 0);
	const max_rev = Math.max(...revenue_7d.map((d: { revenue: number }) => d.revenue), 1);

	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

	const stat_cards = [
		{
			label: 'Total Patients',   value: stats.total_animals,
			sub: `+${stats.new_patients_this_month} this month`,
			Icon: PawPrint,   color: 'text-primary',   bg: 'bg-primary/10',   href: '/u/animals'
		},
		{
			label: 'Total Owners',     value: stats.total_customers,
			sub: 'registered clients',
			Icon: Users,      color: 'text-secondary', bg: 'bg-secondary/10', href: '/u/customers'
		},
		{
			label: "Today's Revenue",  value: formatPHP(stats.today_revenue),
			sub: `${formatPHP(stats.month_revenue)} this month`,
			Icon: TrendingUp, color: 'text-success',   bg: 'bg-success/10',   href: '/u/billing'
		},
		{
			label: "Today's Appts",    value: stats.today_appointments,
			sub: 'scheduled visits',
			Icon: CalendarCheck, color: 'text-info',   bg: 'bg-info/10',      href: '/u/appointments'
		},
		{
			label: 'Low Stock',        value: stats.low_stock_count,
			sub: 'items below threshold',
			Icon: TriangleAlert,
			color: stats.low_stock_count > 0 ? 'text-warning' : 'text-base-content/25',
			bg:    stats.low_stock_count > 0 ? 'bg-warning/10' : 'bg-base-200',
			href: '/u/inventory?low_stock=1'
		},
		{
			label: 'Pending Invoices', value: stats.pending_invoice_count,
			sub: 'awaiting payment',
			Icon: ReceiptText,
			color: stats.pending_invoice_count > 0 ? 'text-error' : 'text-base-content/25',
			bg:    stats.pending_invoice_count > 0 ? 'bg-error/10' : 'bg-base-200',
			href: '/u/billing?status=sent'
		}
	];
</script>

<svelte:head><title>EasyVet — Dashboard</title></svelte:head>

<div class="ev-page">

	<!-- Greeting row -->
	<div class="flex items-center justify-between ev-fade-up">
		<div>
			<h1 class="text-xl font-bold text-base-content">{greeting} 👋</h1>
			<p class="mt-0.5 text-xs text-base-content/45">
				{date.formatDate({ date: new Date(), format: 'wkf, MMMM dd, yyyy' })}
			</p>
		</div>
		<a href={resolve('/u/animals/new')} class="btn btn-sm btn-primary gap-1.5 shadow-sm">
			<CirclePlus class="size-3.5" strokeWidth={2.5} /> New Patient
		</a>
	</div>

	<!-- Stat cards -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
		{#each stat_cards as card, i}
			<a href={resolve(card.href)} class="ev-stat-card ev-fade-up" style="animation-delay:{i*0.05}s">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<p class="text-[0.65rem] font-semibold uppercase tracking-wider text-base-content/40">{card.label}</p>
						<p class="mt-1.5 text-2xl font-bold text-base-content leading-none">{card.value}</p>
						<p class="mt-1.5 text-[0.7rem] text-base-content/40 truncate">{card.sub}</p>
					</div>
					<div class="rounded-lg p-2 flex-shrink-0 {card.bg}">
						<card.Icon class="size-4 {card.color}" strokeWidth={1.75} />
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Main grid -->
	<div class="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-hidden">

		<!-- Recent patients -->
		<div class="col-span-2 ev-panel flex flex-col ev-fade-up ev-d2 overflow-hidden">
			<div class="flex items-center justify-between px-5 pt-4 pb-3">
				<h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40">Recent Patients</h2>
				<a href={resolve('/u/animals')} class="btn btn-xs btn-ghost gap-1 text-primary hover:text-primary">
					View all <ArrowUpRight class="size-3" />
				</a>
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
				<table class="ev-table w-full">
					<thead>
						<tr>
							<th>Animal</th>
							<th>Owner</th>
							<th>Visits</th>
							<th>Since</th>
						</tr>
					</thead>
					<tbody>
						{#each recent_animals as animal}
							<tr class="cursor-pointer" onclick={() => location.href = resolve(`/u/animals/${animal._id}`)}>
								<td>
									<div class="flex items-center gap-2.5">
										<span class="text-lg leading-none">{species_emoji[animal.species] ?? '🐾'}</span>
										<div>
											<p class="font-semibold text-base-content">{animal.name}</p>
											<p class="text-[0.7rem] text-base-content/40 capitalize">{animal.species} · {animal.breed}</p>
										</div>
									</div>
								</td>
								<td class="text-base-content/70">{animal.customer_id?.firstname} {animal.customer_id?.lastname}</td>
								<td>
									<span class="badge badge-ghost badge-sm">{animal.medical_records?.length ?? 0}</span>
								</td>
								<td class="text-base-content/45">{date.formatDate({ date: animal.createdAt, format: 'MMM dd, yyyy' })}</td>
							</tr>
						{:else}
							<tr><td colspan="4">
								<div class="ev-empty"><PawPrint class="size-8" /><p class="text-sm">No patients yet</p></div>
							</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Right column -->
		<div class="col-span-1 flex flex-col gap-4 min-h-0 overflow-y-auto">

			<!-- Species mix -->
			<div class="ev-panel p-5 ev-fade-up ev-d3">
				<h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-3.5">Patient Mix</h2>
				<div class="space-y-3">
					{#each species_breakdown as sp}
						<div class="flex items-center gap-2.5">
							<span class="text-base leading-none">{species_emoji[sp._id] ?? '🐾'}</span>
							<div class="flex-1 min-w-0">
								<div class="flex justify-between text-xs mb-1">
									<span class="capitalize font-medium text-base-content/70">{sp._id}</span>
									<span class="text-base-content/45 tabular-nums">{sp.count}</span>
								</div>
								<div class="h-1.5 rounded-full bg-base-200 overflow-hidden">
									<div
										class="h-full rounded-full bg-primary transition-all duration-700"
										style="width:{total_species > 0 ? (sp.count / total_species) * 100 : 0}%"
									></div>
								</div>
							</div>
						</div>
					{:else}
						<p class="text-xs text-base-content/30 text-center py-3">No data yet</p>
					{/each}
				</div>
			</div>

			<!-- Today's visits -->
			<div class="ev-panel p-5 flex-1 flex flex-col min-h-0 ev-fade-up ev-d4">
				<div class="flex items-center justify-between mb-3.5">
					<h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40">Today's Visits</h2>
					<a href={resolve('/u/appointments')} class="btn btn-xs btn-ghost text-primary"><ArrowUpRight class="size-3" /></a>
				</div>
				<div class="space-y-2 overflow-y-auto min-h-0 flex-1">
					{#each upcoming_appointments as appt}
						<div class="rounded-lg border border-base-content/[0.07] bg-base-200/40 p-3">
							<div class="flex items-start justify-between gap-2">
								<div>
									<p class="text-xs font-semibold text-base-content">{appt.animal_id?.name ?? '—'}</p>
									<p class="text-[0.7rem] text-base-content/45 capitalize mt-0.5">{appt.type}</p>
								</div>
								<span class="badge badge-primary badge-xs shrink-0">
									{date.formatDate({ date: appt.scheduled_at, format: 'hh:mm aa' })}
								</span>
							</div>
						</div>
					{:else}
						<div class="ev-empty py-4">
							<CalendarCheck class="size-6" />
							<p class="text-xs">No visits today</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Revenue bar chart -->
	{#if revenue_7d.length > 0}
		<div class="ev-panel p-5 ev-fade-up ev-d5">
			<h2 class="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-4">Revenue — Last 7 Days</h2>
			<div class="flex items-end gap-1.5 h-20">
				{#each revenue_7d as day}
					<div class="flex flex-1 flex-col items-center gap-1 min-w-0">
						<p class="text-[0.6rem] text-base-content/35 tabular-nums truncate w-full text-center">{formatPHP(day.revenue)}</p>
						<div
							class="w-full rounded-t-sm bg-primary/80 hover:bg-primary transition-all duration-200"
							style="height:{Math.max(4, (day.revenue / max_rev) * 56)}px"
							title="{day._id}: {formatPHP(day.revenue)}"
						></div>
						<p class="text-[0.6rem] text-base-content/30">{day._id.slice(5)}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
