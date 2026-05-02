import type { PageServerLoad, Actions } from './$types';
import AppointmentsModel from '$lib/server/models/appointments.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 15);
	const status_filter = url.searchParams.get('status') ?? '';
	const date_filter = url.searchParams.get('date') ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;
	if (date_filter) {
		const d = new Date(date_filter);
		const next = new Date(d);
		next.setDate(next.getDate() + 1);
		query.scheduled_at = { $gte: d, $lt: next };
	}

	const [appointments_raw, total, customers_raw, animals_raw] = await Promise.all([
		AppointmentsModel.find(query)
			.sort({ scheduled_at: 1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		AppointmentsModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	return {
		appointments: JSON.parse(JSON.stringify(appointments_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter, date_filter
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const animal_id = fd.get('animal_id') as string;
		const customer_id = fd.get('customer_id') as string;
		const scheduled_at = fd.get('scheduled_at') as string;
		const type = fd.get('type') as string;
		const veterinarian = (fd.get('veterinarian') as string)?.trim();
		const duration_minutes = parseInt(fd.get('duration_minutes') as string) || 30;
		const notes = (fd.get('notes') as string)?.trim() ?? '';

		if (!animal_id || !customer_id || !scheduled_at || !type || !veterinarian) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		await AppointmentsModel.create({
			animal_id, customer_id, scheduled_at: new Date(scheduled_at),
			type, veterinarian, duration_minutes, notes
		});

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const status = fd.get('status') as string;
		if (!id || !status) return fail(400, { error: 'Missing data.' });
		await AppointmentsModel.findByIdAndUpdate(id, { status });
		return { success: true };
	}
};
