import type { PageServerLoad, Actions } from './$types';
import ConsultationsModel from '$lib/server/models/consultations.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 10);
	const status_filter = url.searchParams.get('status') ?? '';
	const search = url.searchParams.get('q')?.trim() ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;

	const [consultations_raw, total, customers_raw, animals_raw] = await Promise.all([
		ConsultationsModel.find(query)
			.sort({ scheduled_at: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species breed')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		ConsultationsModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	// Stats
	const [total_today, total_completed, total_pending] = await Promise.all([
		ConsultationsModel.countDocuments({
			archived: false,
			scheduled_at: {
				$gte: new Date(new Date().setHours(0, 0, 0, 0)),
				$lt: new Date(new Date().setHours(23, 59, 59, 999))
			}
		}),
		ConsultationsModel.countDocuments({ archived: false, status: 'completed' }),
		ConsultationsModel.countDocuments({ archived: false, status: { $in: ['scheduled', 'in-progress'] } })
	]);

	return {
		consultations: JSON.parse(JSON.stringify(consultations_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter, search,
		stats: { total_today, total_completed, total_pending }
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const animal_id = fd.get('animal_id') as string;
		const customer_id = fd.get('customer_id') as string;
		const type = fd.get('type') as string;
		const scheduled_at = fd.get('scheduled_at') as string;
		const veterinarian = (fd.get('veterinarian') as string)?.trim();
		const chief_complaint = (fd.get('chief_complaint') as string)?.trim();
		const service_fee = parseFloat(fd.get('service_fee') as string) || 0;
		const notes = (fd.get('notes') as string)?.trim() ?? '';
		const history = (fd.get('history') as string)?.trim() ?? '';

		if (!animal_id || !customer_id || !scheduled_at || !veterinarian || !chief_complaint) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		await ConsultationsModel.create({
			animal_id, customer_id, type, scheduled_at: new Date(scheduled_at),
			veterinarian, chief_complaint, service_fee, notes, history
		});

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const status = fd.get('status') as string;
		const diagnosis = (fd.get('diagnosis') as string)?.trim() ?? '';
		const treatment_plan = (fd.get('treatment_plan') as string)?.trim() ?? '';

		if (!id || !status) return fail(400, { error: 'Missing data.' });

		const update: Record<string, unknown> = { status };
		if (status === 'completed') update.completed_at = new Date();
		if (diagnosis) update.diagnosis = diagnosis;
		if (treatment_plan) update.treatment_plan = treatment_plan;

		await ConsultationsModel.findByIdAndUpdate(id, update);
		return { success: true };
	}
};
