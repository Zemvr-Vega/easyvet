<script lang="ts">
	import { goto } from '$app/navigation';
	import { TrendingUp, ReceiptText, CreditCard, ArrowUpRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let period = $state(data.period);

	function formatPHP(n: number) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n ?? 0);
	}

	const month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

	// Normalize monthly data to fill all 12 months
	const monthly_chart = month_names.map((name, i) => {
		const found = data.monthly_revenue.find((m: { _id: number }) => m._id === i + 1);
		return { name, revenue: found?.revenue ?? 0, count: found?.count ?? 0 };
	});

	const max_monthly = Math.max(...monthly_chart.map((m) => m.revenue), 1);

	// Daily chart
	const max_daily = Math.max(...data.revenue_by_day.map((d: { revenue: number }) => d.revenue), 1);

	const payment_method_labels: Record<string, string> = {
		cash: '💵 Cash', gcash: '📱 GCash', card: '💳 Card', bank_transfer: '🏦 Bank Transfer'
	};

	const item_type_total =
		data.by_item_type.reduce((s: number, t: { total: number }) => s + t.total, 0) || 1;
</script>

<svelte:head><title>EasyVet - Sales & Revenue</title></svelte:head>

<div class="ev-page">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-bold">Sales & Revenue</h2>
		<div class="join">
			{#each [['week','7 Days'],['month','This Month'],['year','This Year']] as [val, label]}
				<button class="btn join-item btn-sm {period === val ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => { period = val; goto(`/u/sales?period=${val}`); }}>
					{label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		<div class="ev-panel p-4">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-xs text-base-content/50 uppercase tracking-wider">Period Revenue</p>
					<p class="text-2xl font-bold text-success">{formatPHP(data.summary.period_revenue)}</p>
					<p class="text-xs text-base-content/40 mt-1 capitalize">{period === 'week' ? 'Last 7 days' : period === 'month' ? 'This month' : 'This year'}</p>
				</div>
				<div class="rounded-lg bg-success/10 p-2">
					<TrendingUp class="size-5 text-success" />
				</div>
			</div>
		</div>
		<div class="ev-panel p-4">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-xs text-base-content/50 uppercase tracking-wider">All-time Revenue</p>
					<p class="text-2xl font-bold">{formatPHP(data.summary.total_revenue)}</p>
					<p class="text-xs text-base-content/40 mt-1">{data.summary.total_paid_invoices} paid invoices</p>
				</div>
				<div class="rounded-lg bg-primary/10 p-2">
					<ReceiptText class="size-5 text-primary" />
				</div>
			</div>
		</div>
		<div class="ev-panel p-4">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-xs text-base-content/50 uppercase tracking-wider">Avg Invoice</p>
					<p class="text-2xl font-bold">{formatPHP(data.summary.avg_invoice)}</p>
					<p class="text-xs text-base-content/40 mt-1">per transaction</p>
				</div>
				<div class="rounded-lg bg-info/10 p-2">
					<CreditCard class="size-5 text-info" />
				</div>
			</div>
		</div>
		<div class="ev-panel p-4">
			<div class="flex items-start justify-between">
				<div>
					<p class="text-xs text-base-content/50 uppercase tracking-wider">Pending</p>
					<p class="text-2xl font-bold text-warning">{formatPHP(data.summary.total_pending)}</p>
					<p class="text-xs text-base-content/40 mt-1">uncollected</p>
				</div>
				<div class="rounded-lg bg-warning/10 p-2">
					<ReceiptText class="size-5 text-warning" />
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-3 gap-4">
		<!-- Monthly bar chart -->
		<div class="col-span-2 card bg-base-100 p-6">
			<h3 class="text-sm font-semibold uppercase tracking-wider text-base-content/50 mb-4">Monthly Revenue ({new Date().getFullYear()})</h3>
			<div class="flex items-end gap-1 h-40">
				{#each monthly_chart as m}
					<div class="flex flex-col items-center gap-1 flex-1 min-w-0">
						<div
							class="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
							style="height: {(m.revenue / max_monthly) * 128}px; min-height: {m.revenue > 0 ? 4 : 0}px"
							title="{m.name}: {formatPHP(m.revenue)}"
						></div>
						<span class="text-xs text-base-content/40">{m.name}</span>
					</div>
				{/each}
			</div>
			<div class="mt-2 flex justify-end gap-4 text-xs text-base-content/40">
				{#each monthly_chart as m}
					{#if m.revenue > 0}
						<span>{m.name}: {formatPHP(m.revenue)}</span>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Right column -->
		<div class="col-span-1 flex flex-col gap-4">
			<!-- Payment methods -->
			<div class="ev-panel p-5">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-base-content/50 mb-3">Payment Methods</h3>
				<div class="space-y-2">
					{#each data.by_payment_method as pm}
						{@const pct = data.summary.period_revenue > 0 ? (pm.total / data.summary.period_revenue) * 100 : 0}
						<div>
							<div class="flex justify-between text-xs mb-0.5">
								<span>{payment_method_labels[pm._id] ?? pm._id}</span>
								<span class="font-semibold">{formatPHP(pm.total)}</span>
							</div>
							<div class="h-1.5 rounded-full bg-base-200">
								<div class="h-1.5 rounded-full bg-primary" style="width: {pct}%"></div>
							</div>
						</div>
					{:else}
						<p class="text-xs text-base-content/30 text-center py-4">No data</p>
					{/each}
				</div>
			</div>

			<!-- Service vs Inventory split -->
			<div class="ev-panel p-5">
				<h3 class="text-sm font-semibold uppercase tracking-wider text-base-content/50 mb-3">Revenue Split</h3>
				<div class="space-y-2">
					{#each data.by_item_type as t}
						{@const pct = (t.total / item_type_total) * 100}
						<div>
							<div class="flex justify-between text-xs mb-0.5">
								<span class="capitalize">{t._id}</span>
								<span class="font-semibold">{pct.toFixed(1)}%</span>
							</div>
							<div class="h-1.5 rounded-full bg-base-200">
								<div class="h-1.5 rounded-full {t._id === 'service' ? 'bg-primary' : 'bg-secondary'}"
									style="width: {pct}%"></div>
							</div>
						</div>
					{:else}
						<p class="text-xs text-base-content/30 text-center py-4">No data</p>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Top Services -->
	<div class="ev-panel p-5">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-sm font-semibold uppercase tracking-wider text-base-content/50">Top Services</h3>
			<a href={resolve('/u/billing')} class="btn btn-xs btn-ghost gap-1">
				View All <ArrowUpRight class="size-3" />
			</a>
		</div>
		<table class="ev-table">
			<thead class="text-xs">
				<tr><th>Service</th><th class="text-right">Qty</th><th class="text-right">Revenue</th></tr>
			</thead>
			<tbody class="text-xs">
				{#each data.top_services as s}
					<tr class="hover:bg-base-200">
						<td>{s._id}</td>
						<td class="text-right">{s.count}</td>
						<td class="text-right font-semibold">{formatPHP(s.total)}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="py-8 text-center text-base-content/30">No data for this period</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
