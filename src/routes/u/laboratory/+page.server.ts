import type { PageServerLoad, Actions } from './$types';
import LaboratoryModel from '$lib/server/models/laboratory.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { logActivity } from '$lib/server/activity-log';
import { notify } from '$lib/server/email';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 10);
	const status_filter = url.searchParams.get('status') ?? '';
	const type_filter = url.searchParams.get('type') ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;
	if (type_filter) query.test_type = type_filter;

	const [tests_raw, total, customers_raw, animals_raw] = await Promise.all([
		LaboratoryModel.find(query)
			.sort({ requested_date: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species breed')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		LaboratoryModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	const [pending_count, completed_count] = await Promise.all([
		LaboratoryModel.countDocuments({ archived: false, status: 'pending' }),
		LaboratoryModel.countDocuments({ archived: false, status: 'completed' })
	]);

	return {
		tests: JSON.parse(JSON.stringify(tests_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter, type_filter,
		stats: { pending_count, completed_count }
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const animal_id = fd.get('animal_id') as string;
		const customer_id = fd.get('customer_id') as string;
		const test_type = fd.get('test_type') as string;
		const test_name = (fd.get('test_name') as string)?.trim();
		const requested_by = (fd.get('requested_by') as string)?.trim();
		const sample_type = (fd.get('sample_type') as string)?.trim() ?? '';
		const service_fee = parseFloat(fd.get('service_fee') as string) || 0;
		const notes = (fd.get('notes') as string)?.trim() ?? '';

		if (!animal_id || !customer_id || !test_type || !test_name || !requested_by) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		await LaboratoryModel.create({
			animal_id, customer_id, test_type, test_name,
			requested_by, sample_type, service_fee, notes,
			requested_date: new Date()
		});

		return { success: true };
	},

	update_result: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const status = fd.get('status') as string;
		const result_summary = (fd.get('result_summary') as string)?.trim() ?? '';
		const result_interpretation = (fd.get('result_interpretation') as string)?.trim() ?? '';
		const performed_by = (fd.get('performed_by') as string)?.trim() ?? '';

		if (!id) return fail(400, { error: 'Missing ID.' });

		const update: Record<string, unknown> = { status };
		if (result_summary) update.result_summary = result_summary;
		if (result_interpretation) update.result_interpretation = result_interpretation;
		if (performed_by) update.performed_by = performed_by;
		if (status === 'completed') update.resulted_date = new Date();
		if (status === 'in-progress') update.collected_date = new Date();

		await LaboratoryModel.findByIdAndUpdate(id, update);
		return { success: true };
	}
};
