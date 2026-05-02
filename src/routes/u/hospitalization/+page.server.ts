import type { PageServerLoad, Actions } from './$types';
import HospitalizationModel from '$lib/server/models/hospitalization.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 10);
	const status_filter = url.searchParams.get('status') ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;

	const [records_raw, total, customers_raw, animals_raw] = await Promise.all([
		HospitalizationModel.find(query)
			.sort({ admitted_at: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species breed')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		HospitalizationModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	// Current inpatients
	const admitted_count = await HospitalizationModel.countDocuments({
		archived: false,
		status: { $in: ['admitted', 'stable', 'critical', 'improving'] }
	});

	return {
		records: JSON.parse(JSON.stringify(records_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter,
		admitted_count
	};
};

export const actions: Actions = {
	admit: async ({ request }) => {
		const fd = await request.formData();
		const animal_id = fd.get('animal_id') as string;
		const customer_id = fd.get('customer_id') as string;
		const reason = fd.get('reason') as string;
		const reason_detail = (fd.get('reason_detail') as string)?.trim();
		const attending_vet = (fd.get('attending_vet') as string)?.trim();
		const cage_number = (fd.get('cage_number') as string)?.trim() ?? '';
		const ward = (fd.get('ward') as string)?.trim() ?? 'general';
		const daily_rate = parseFloat(fd.get('daily_rate') as string) || 0;
		const admission_notes = (fd.get('admission_notes') as string)?.trim() ?? '';
		const expected_discharge_str = fd.get('expected_discharge') as string;

		if (!animal_id || !customer_id || !reason || !reason_detail || !attending_vet) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		await HospitalizationModel.create({
			animal_id, customer_id, reason, reason_detail, attending_vet,
			cage_number, ward, daily_rate, admission_notes,
			admitted_at: new Date(),
			expected_discharge: expected_discharge_str ? new Date(expected_discharge_str) : undefined,
			status: 'admitted'
		});

		return { success: true };
	},

	add_note: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const noted_by = (fd.get('noted_by') as string)?.trim();
		const note = (fd.get('note') as string)?.trim();
		const temperature_c = parseFloat(fd.get('temperature_c') as string) || undefined;
		const heart_rate_bpm = parseFloat(fd.get('heart_rate_bpm') as string) || undefined;
		const weight_kg = parseFloat(fd.get('weight_kg') as string) || undefined;

		if (!id || !noted_by || !note) return fail(400, { error: 'Missing required fields.' });

		await HospitalizationModel.findByIdAndUpdate(id, {
			$push: {
				progress_notes: {
					noted_by, note,
					vital_signs: { temperature_c, heart_rate_bpm, weight_kg }
				}
			}
		});

		return { success: true };
	},

	discharge: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const discharge_notes = (fd.get('discharge_notes') as string)?.trim() ?? '';
		const discharge_instructions = (fd.get('discharge_instructions') as string)?.trim() ?? '';

		if (!id) return fail(400, { error: 'Missing ID.' });

		await HospitalizationModel.findByIdAndUpdate(id, {
			status: 'discharged',
			discharged_at: new Date(),
			discharge_notes,
			discharge_instructions
		});

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const status = fd.get('status') as string;
		if (!id || !status) return fail(400, { error: 'Missing data.' });
		await HospitalizationModel.findByIdAndUpdate(id, { status });
		return { success: true };
	}
};
