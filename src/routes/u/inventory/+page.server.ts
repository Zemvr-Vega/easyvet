import type { PageServerLoad, Actions } from './$types';
import InventoryModel from '$lib/server/models/inventory.model';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import Inventory from '$lib/validation/inventory.zod';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size')) || 20));
	const search = url.searchParams.get('q')?.trim() ?? '';
	const category = url.searchParams.get('category') ?? '';
	const low_stock_only = url.searchParams.get('low_stock') === '1';

	const query: Record<string, unknown> = { archived: false };

	if (search) {
		const regex = { $regex: search, $options: 'i' };
		query.$or = [{ name: regex }, { sku: regex }, { description: regex }];
	}
	if (category) query.category = category;
	if (low_stock_only) query.$expr = { $lte: ['$quantity', '$reorder_level'] };

	const [items_raw, total, low_stock_count] = await Promise.all([
		InventoryModel.find(query)
			.sort({ name: 1 })
			.skip((page - 1) * size)
			.limit(size)
			.lean(),
		InventoryModel.countDocuments(query),
		InventoryModel.countDocuments({
			archived: false,
			$expr: { $lte: ['$quantity', '$reorder_level'] }
		})
	]);

	const items = JSON.parse(JSON.stringify(items_raw));
	const form = await superValidate(zod4(Inventory.NewSchema));

	return { items, total, page, size, search, category, low_stock_only, low_stock_count, form };
};

export const actions: Actions = {
	new: async ({ request }) => {
		const form = await superValidate(request, zod4(Inventory.NewSchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please fix the errors below.' }, { status: 400 });
		}

		const existing = await InventoryModel.findOne({ sku: form.data.sku.toUpperCase() });
		if (existing) {
			form.errors.sku = ['An item with this SKU already exists.'];
			return message(form, { type: 'error', text: 'SKU already exists.' }, { status: 400 });
		}

		await InventoryModel.create({
			...form.data,
			sku: form.data.sku.toUpperCase(),
			last_restocked: form.data.quantity > 0 ? new Date() : undefined
		});

		return message(form, { type: 'success', text: 'Item added to inventory.' });
	},

	restock: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const qty = parseInt(fd.get('qty') as string);

		if (!id || isNaN(qty) || qty <= 0) return fail(400, { error: 'Invalid restock data.' });

		await InventoryModel.findByIdAndUpdate(id, {
			$inc: { quantity: qty },
			last_restocked: new Date()
		});

		return { success: true };
	},

	archive: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID.' });
		await InventoryModel.findByIdAndUpdate(id, { archived: true });
		return { success: true };
	}
};
