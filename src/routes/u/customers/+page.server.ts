import type { PageServerLoad, Actions } from './$types';
import CustomersModel from '$lib/server/models/customers.model';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import Customer from '$lib/validation/customers.zod';
import AnimalsModel from '$lib/server/models/animals.model';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Math.max(1, Number(url.searchParams.get('size')) || 10));
	const search = url.searchParams.get('q')?.trim() ?? '';

	const query: Record<string, unknown> = { archived: false };

	if (search) {
		const regex = { $regex: search, $options: 'i' };
		query.$or = [
			{ firstname: regex },
			{ lastname: regex },
			{ email: regex },
			{ contact_number: regex }
		];
	}

	const [customers_raw, total] = await Promise.all([
		CustomersModel.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.lean(),
		CustomersModel.countDocuments(query)
	]);

	// Attach pet count per customer
	const customer_ids = customers_raw.map((c) => c._id);
	const pet_counts_raw = await AnimalsModel.aggregate([
		{ $match: { customer_id: { $in: customer_ids }, archived: false } },
		{ $group: { _id: '$customer_id', count: { $sum: 1 } } }
	]);
	const pet_map = new Map(pet_counts_raw.map((r) => [r._id.toString(), r.count]));

	const customers = customers_raw.map((c) => ({
		...c,
		_id: c._id.toString(),
		pet_count: pet_map.get(c._id.toString()) ?? 0
	}));

	return { customers, total, page, size, search };
};

export const actions: Actions = {
	archive: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		if (!id) return message(await superValidate(zod4(Customer.NewSchema)), { type: 'error', text: 'Missing ID.' });
		await CustomersModel.findByIdAndUpdate(id, { archived: true });
		return { success: true };
	}
};
