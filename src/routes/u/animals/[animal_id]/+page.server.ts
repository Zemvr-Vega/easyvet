import type { PageServerLoad, Actions } from './$types';
import AnimalsModel from '$lib/server/models/animals.model';
import InventoryModel from '$lib/server/models/inventory.model';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const animal_raw = await AnimalsModel.findOne({ _id: params.animal_id, archived: false })
		.populate('customer_id', 'firstname lastname contact_number email _id')
		.lean();

	if (!animal_raw) error(404, 'Animal not found.');

	// Fetch inventory for the add-record form
	const inventory_raw = await InventoryModel.find({ archived: false, quantity: { $gt: 0 } })
		.select('name sku unit_price unit category')
		.sort({ name: 1 })
		.lean();

	const animal = JSON.parse(JSON.stringify(animal_raw));
	const inventory = JSON.parse(JSON.stringify(inventory_raw));

	return { animal, inventory };
};

export const actions: Actions = {
	add_weight: async ({ request, params }) => {
		const fd = await request.formData();
		const weight_kg = parseFloat(fd.get('weight_kg') as string);
		const recorded_by = (fd.get('recorded_by') as string)?.trim() || 'Staff';

		if (!weight_kg || weight_kg <= 0 || weight_kg > 1000) {
			return fail(400, { error: 'Invalid weight value.' });
		}

		await AnimalsModel.findByIdAndUpdate(params.animal_id, {
			$push: { weight_history: { weight_kg, recorded_by } }
		});

		return { success: true };
	},

	add_record: async ({ request, params }) => {
		const fd = await request.formData();

		const visit_type = fd.get('visit_type') as string;
		const chief_complaint = (fd.get('chief_complaint') as string)?.trim();
		const diagnosis = (fd.get('diagnosis') as string)?.trim() ?? '';
		const treatment = (fd.get('treatment') as string)?.trim() ?? '';
		const prescriptions_raw = (fd.get('prescriptions') as string)?.trim() ?? '';
		const service_fee = parseFloat(fd.get('service_fee') as string) || 0;
		const veterinarian = (fd.get('veterinarian') as string)?.trim();
		const notes = (fd.get('notes') as string)?.trim() ?? '';
		const next_visit_date = fd.get('next_visit_date') as string;
		const temperature_c = parseFloat(fd.get('temperature_c') as string) || undefined;
		const heart_rate_bpm = parseFloat(fd.get('heart_rate_bpm') as string) || undefined;
		const respiratory_rate = parseFloat(fd.get('respiratory_rate') as string) || undefined;

		// Inventory items used (multi-row: inventory_id[], qty[], unit_price[])
		const inv_ids = fd.getAll('inv_id[]') as string[];
		const inv_qtys = fd.getAll('inv_qty[]').map(Number);
		const inv_prices = fd.getAll('inv_unit_price[]').map(Number);
		const inv_names = fd.getAll('inv_name[]') as string[];

		if (!visit_type || !chief_complaint || !veterinarian) {
			return fail(400, { error: 'Visit type, complaint, and veterinarian are required.' });
		}

		const inventory_used = inv_ids
			.map((id, i) => ({
				inventory_id: id,
				item_name: inv_names[i] ?? '',
				quantity: inv_qtys[i] ?? 1,
				unit_price: inv_prices[i] ?? 0
			}))
			.filter((item) => item.inventory_id && item.quantity > 0);

		// Deduct inventory quantities
		for (const item of inventory_used) {
			await InventoryModel.findByIdAndUpdate(item.inventory_id, {
				$inc: { quantity: -item.quantity }
			});
		}

		await AnimalsModel.findByIdAndUpdate(params.animal_id, {
			$push: {
				medical_records: {
					visit_type,
					chief_complaint,
					diagnosis,
					treatment,
					prescriptions: prescriptions_raw
						? prescriptions_raw.split(',').map((p) => p.trim()).filter(Boolean)
						: [],
					vital_signs: { temperature_c, heart_rate_bpm, respiratory_rate },
					inventory_used,
					service_fee,
					veterinarian,
					notes,
					next_visit_date: next_visit_date ? new Date(next_visit_date) : undefined
				}
			}
		});

		return { success: true };
	}
};
