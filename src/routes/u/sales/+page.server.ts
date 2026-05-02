import type { PageServerLoad } from './$types';
import InvoicesModel from '$lib/server/models/invoices.model';

export const load: PageServerLoad = async ({ url }) => {
	const period = url.searchParams.get('period') ?? 'month';

	const now = new Date();
	let date_from: Date;

	if (period === 'week') {
		date_from = new Date(now.getTime() - 7 * 86400000);
	} else if (period === 'year') {
		date_from = new Date(now.getFullYear(), 0, 1);
	} else {
		// month
		date_from = new Date(now.getFullYear(), now.getMonth(), 1);
	}

	// Revenue by day
	const revenue_by_day = await InvoicesModel.aggregate([
		{ $match: { status: 'paid', paid_at: { $gte: date_from } } },
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$paid_at' } },
				revenue: { $sum: '$total' },
				count: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	// Revenue by payment method
	const by_payment_method = await InvoicesModel.aggregate([
		{ $match: { status: 'paid', paid_at: { $gte: date_from } } },
		{ $group: { _id: '$payment_method', total: { $sum: '$total' }, count: { $sum: 1 } } },
		{ $sort: { total: -1 } }
	]);

	// Service vs inventory breakdown (from invoice items)
	const by_item_type = await InvoicesModel.aggregate([
		{ $match: { status: 'paid', paid_at: { $gte: date_from } } },
		{ $unwind: '$items' },
		{ $group: { _id: '$items.type', total: { $sum: '$items.total' }, count: { $sum: 1 } } }
	]);

	// All-time totals
	const [total_revenue, total_paid_invoices, total_pending, avg_invoice] = await Promise.all([
		InvoicesModel.aggregate([
			{ $match: { status: 'paid' } },
			{ $group: { _id: null, total: { $sum: '$total' } } }
		]),
		InvoicesModel.countDocuments({ status: 'paid' }),
		InvoicesModel.aggregate([
			{ $match: { status: { $in: ['sent', 'draft', 'overdue'] } } },
			{ $group: { _id: null, total: { $sum: '$total' } } }
		]),
		InvoicesModel.aggregate([
			{ $match: { status: 'paid' } },
			{ $group: { _id: null, avg: { $avg: '$total' } } }
		])
	]);

	// Top services sold
	const top_services = await InvoicesModel.aggregate([
		{ $match: { status: 'paid', paid_at: { $gte: date_from } } },
		{ $unwind: '$items' },
		{ $match: { 'items.type': 'service' } },
		{ $group: { _id: '$items.description', total: { $sum: '$items.total' }, count: { $sum: 1 } } },
		{ $sort: { total: -1 } },
		{ $limit: 10 }
	]);

	// Monthly revenue for the year
	const monthly_revenue = await InvoicesModel.aggregate([
		{
			$match: {
				status: 'paid',
				paid_at: { $gte: new Date(now.getFullYear(), 0, 1) }
			}
		},
		{
			$group: {
				_id: { $month: '$paid_at' },
				revenue: { $sum: '$total' },
				count: { $sum: 1 }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	return {
		period,
		revenue_by_day,
		by_payment_method,
		by_item_type,
		top_services,
		monthly_revenue,
		summary: {
			total_revenue: total_revenue[0]?.total ?? 0,
			total_paid_invoices,
			total_pending: total_pending[0]?.total ?? 0,
			avg_invoice: avg_invoice[0]?.avg ?? 0,
			period_revenue: revenue_by_day.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0)
		}
	};
};
