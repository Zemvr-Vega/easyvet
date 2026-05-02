import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import InventoryModel from '$lib/server/models/inventory.model';
import InvoicesModel from '$lib/server/models/invoices.model';
import AppointmentsModel from '$lib/server/models/appointments.model';
import HospitalizationModel from '$lib/server/models/hospitalization.model';

export const GET: RequestHandler = async () => {
	const now = new Date();
	const today_start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const today_end = new Date(today_start.getTime() + 86400000);

	const [
		total_animals,
		total_customers,
		today_appointments,
		low_stock_count,
		pending_invoice_count,
		today_paid,
		current_inpatients
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
		HospitalizationModel.countDocuments({
			archived: false,
			status: { $in: ['admitted', 'stable', 'critical', 'improving'] }
		})
	]);

	const today_revenue = today_paid.reduce((s, i) => s + (i.total ?? 0), 0);

	return json({
		total_animals,
		total_customers,
		today_appointments,
		low_stock_count,
		pending_invoice_count,
		today_revenue,
		current_inpatients
	});
};
