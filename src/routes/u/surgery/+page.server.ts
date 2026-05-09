import type { PageServerLoad, Actions } from './$types';
import SurgeriesModel from '$lib/server/models/surgeries.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { logActivity } from '$lib/server/activity-log';
import { notify } from '$lib/server/email';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 10);
	const status_filter = url.searchParams.get('status') ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;

	const [surgeries_raw, total, customers_raw, animals_raw] = await Promise.all([
		SurgeriesModel.find(query)
			.sort({ scheduled_at: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species breed')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		SurgeriesModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	const [scheduled_count, completed_count, today_count] = await Promise.all([
		SurgeriesModel.countDocuments({ archived: false, status: { $in: ['scheduled', 'prep'] } }),
		SurgeriesModel.countDocuments({ archived: false, status: 'completed' }),
		SurgeriesModel.countDocuments({
			archived: false,
			scheduled_at: {
				$gte: new Date(new Date().setHours(0, 0, 0, 0)),
				$lt: new Date(new Date().setHours(23, 59, 59, 999))
			}
		})
	]);

	return {
		surgeries: JSON.parse(JSON.stringify(surgeries_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter,
		stats: { scheduled_count, completed_count, today_count }
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const animal_id = fd.get('animal_id') as string;
		const customer_id = fd.get('customer_id') as string;
		const type = fd.get('type') as string;
		const description = (fd.get('description') as string)?.trim();
		const scheduled_at_str = fd.get('scheduled_at') as string;
		const surgeon = (fd.get('surgeon') as string)?.trim();
		const anesthesia_type = fd.get('anesthesia_type') as string;
		const service_fee = parseFloat(fd.get('service_fee') as string) || 0;
		const pre_op_notes = (fd.get('pre_op_notes') as string)?.trim() ?? '';
		const consent_obtained = fd.get('consent_obtained') === 'on';

		if (!animal_id || !customer_id || !type || !description || !scheduled_at_str || !surgeon) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		await SurgeriesModel.create({
			animal_id, customer_id, type, description,
			scheduled_at: new Date(scheduled_at_str),
			surgeon, anesthesia_type, service_fee, pre_op_notes, consent_obtained
		});

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const status = fd.get('status') as string;
		if (!id || !status) return fail(400, { error: 'Missing data.' });

		const update: Record<string, unknown> = { status };
		if (status === 'in-progress') update.started_at = new Date();
		if (status === 'completed') update.completed_at = new Date();

		await SurgeriesModel.findByIdAndUpdate(id, update);
		return { success: true };
	}
};
