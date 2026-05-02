import type { PageServerLoad } from './$types';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import InventoryModel from '$lib/server/models/inventory.model';
import InvoicesModel from '$lib/server/models/invoices.model';
import AppointmentsModel from '$lib/server/models/appointments.model';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const today_start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const today_end = new Date(today_start.getTime() + 86400000);
	const month_start = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		total_animals,
		total_customers,
		today_appointments,
		low_stock_count,
		pending_invoice_count,
		today_paid,
		month_paid,
		new_patients_this_month,
		recent_animals_raw,
		upcoming_appts_raw,
		species_breakdown
	] = await Promise.all([
		AnimalsModel.countDocuments({ archived: false }),
		CustomersModel.countDocuments({ archived: false }),
		AppointmentsModel.countDocuments({
			scheduled_at: { $gte: today_start, $lt: today_end },
			archived: false
		}),
		InventoryModel.countDocuments({
			archived: false,
			$expr: { $lte: ['$quantity', '$reorder_level'] }
		}),
		InvoicesModel.countDocuments({ status: { $in: ['draft', 'sent', 'overdue'] } }),
		InvoicesModel.find({ status: 'paid', paid_at: { $gte: today_start, $lt: today_end } }).lean(),
		InvoicesModel.find({ status: 'paid', paid_at: { $gte: month_start } }).lean(),
		AnimalsModel.countDocuments({ archived: false, createdAt: { $gte: month_start } }),
		AnimalsModel.find({ archived: false })
			.sort({ createdAt: -1 })
			.limit(6)
			.populate('customer_id', 'firstname lastname')
			.lean(),
		AppointmentsModel.find({
			scheduled_at: { $gte: today_start, $lt: today_end },
			archived: false
		})
			.sort({ scheduled_at: 1 })
			.populate('animal_id', 'name species')
			.lean(),
		AnimalsModel.aggregate([
			{ $match: { archived: false } },
			{ $group: { _id: '$species', count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		])
	]);

	const today_revenue = today_paid.reduce((s, i) => s + (i.total ?? 0), 0);
	const month_revenue = month_paid.reduce((s, i) => s + (i.total ?? 0), 0);

	// Revenue last 7 days chart data
	const revenue_7d = await InvoicesModel.aggregate([
		{ $match: { status: 'paid', paid_at: { $gte: new Date(Date.now() - 7 * 86400000) } } },
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$paid_at' } },
				revenue: { $sum: '$total' }
			}
		},
		{ $sort: { _id: 1 } }
	]);

	return {
		stats: {
			total_animals,
			total_customers,
			today_appointments,
			low_stock_count,
			pending_invoice_count,
			today_revenue,
			month_revenue,
			new_patients_this_month
		},
		recent_animals: JSON.parse(JSON.stringify(recent_animals_raw)),
		upcoming_appointments: JSON.parse(JSON.stringify(upcoming_appts_raw)),
		species_breakdown,
		revenue_7d
	};
};
