import type { PageServerLoad, Actions } from './$types';
import VaccinationsModel from '$lib/server/models/vaccinations.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 10);
	const status_filter = url.searchParams.get('status') ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;

	// Upcoming due (next 30 days) for alert count
	const upcoming_due_count = await VaccinationsModel.countDocuments({
		archived: false,
		next_due_date: {
			$gte: new Date(),
			$lte: new Date(Date.now() + 30 * 86400000)
		},
		status: 'administered'
	});

	const [vaccinations_raw, total, customers_raw, animals_raw] = await Promise.all([
		VaccinationsModel.find(query)
			.sort({ scheduled_date: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species breed')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		VaccinationsModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	return {
		vaccinations: JSON.parse(JSON.stringify(vaccinations_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter,
		upcoming_due_count
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const animal_id = fd.get('animal_id') as string;
		const customer_id = fd.get('customer_id') as string;
		const type = fd.get('type') as string;
		const vaccine_name = (fd.get('vaccine_name') as string)?.trim();
		const vaccine_brand = (fd.get('vaccine_brand') as string)?.trim() ?? '';
		const scheduled_date_str = fd.get('scheduled_date') as string;
		const administered_by = (fd.get('administered_by') as string)?.trim() ?? '';
		const dose_number = parseInt(fd.get('dose_number') as string) || 1;
		const next_due_date_str = fd.get('next_due_date') as string;
		const service_fee = parseFloat(fd.get('service_fee') as string) || 0;
		const notes = (fd.get('notes') as string)?.trim() ?? '';

		if (!animal_id || !customer_id || !type || !vaccine_name || !scheduled_date_str) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		await VaccinationsModel.create({
			animal_id, customer_id, type, vaccine_name, vaccine_brand,
			scheduled_date: new Date(scheduled_date_str),
			administered_by,
			dose_number,
			next_due_date: next_due_date_str ? new Date(next_due_date_str) : undefined,
			service_fee, notes,
			status: administered_by ? 'administered' : 'scheduled',
			administered_date: administered_by ? new Date(scheduled_date_str) : undefined
		});

		return { success: true };
	},

	mark_administered: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const administered_by = (fd.get('administered_by') as string)?.trim();
		if (!id) return fail(400, { error: 'Missing ID.' });

		await VaccinationsModel.findByIdAndUpdate(id, {
			status: 'administered',
			administered_date: new Date(),
			administered_by: administered_by || 'Veterinarian'
		});

		return { success: true };
	}
};
