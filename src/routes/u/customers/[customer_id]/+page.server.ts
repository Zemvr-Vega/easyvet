import type { PageServerLoad } from './$types';
import CustomersModel from '$lib/server/models/customers.model';
import AnimalsModel from '$lib/server/models/animals.model';
import InvoicesModel from '$lib/server/models/invoices.model';
import AppointmentsModel from '$lib/server/models/appointments.model';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { customer_id } = params;

	const [customer_raw, animals_raw, recent_invoices_raw, upcoming_appts_raw] = await Promise.all([
		CustomersModel.findOne({ _id: customer_id, archived: false }).lean(),
		AnimalsModel.find({ customer_id, archived: false }).sort({ createdAt: -1 }).lean(),
		InvoicesModel.find({ customer_id })
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
		AppointmentsModel.find({
			customer_id,
			scheduled_at: { $gte: new Date() },
			archived: false
		})
			.sort({ scheduled_at: 1 })
			.limit(5)
			.populate('animal_id', 'name species')
			.lean()
	]);

	if (!customer_raw) error(404, 'Customer not found.');

	// Serialize
	const customer = JSON.parse(JSON.stringify(customer_raw));
	const animals = JSON.parse(JSON.stringify(animals_raw));
	const recent_invoices = JSON.parse(JSON.stringify(recent_invoices_raw));
	const upcoming_appointments = JSON.parse(JSON.stringify(upcoming_appts_raw));

	// Total billed / paid
	const all_invoices = await InvoicesModel.find({ customer_id }).lean();
	const total_billed = all_invoices.reduce((s, i) => s + (i.total ?? 0), 0);
	const total_paid = all_invoices
		.filter((i) => i.status === 'paid')
		.reduce((s, i) => s + (i.total ?? 0), 0);

	return { customer, animals, recent_invoices, upcoming_appointments, total_billed, total_paid };
};
