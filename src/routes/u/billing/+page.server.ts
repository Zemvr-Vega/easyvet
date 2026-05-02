import type { PageServerLoad, Actions } from './$types';
import InvoicesModel from '$lib/server/models/invoices.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import InventoryModel from '$lib/server/models/inventory.model';
import { generateInvoiceNumber, calculateTotals } from '$lib/server/billing';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 15);
	const status_filter = url.searchParams.get('status') ?? '';

	const query: Record<string, unknown> = {};
	if (status_filter) query.status = status_filter;

	const [invoices_raw, total, customers_raw, inventory_raw] = await Promise.all([
		InvoicesModel.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('customer_id', 'firstname lastname')
			.populate('animal_id', 'name species')
			.lean(),
		InvoicesModel.countDocuments(query),
		CustomersModel.find({ archived: false })
			.select('firstname lastname _id')
			.sort({ firstname: 1 })
			.lean(),
		InventoryModel.find({ archived: false, quantity: { $gt: 0 } })
			.select('name sku unit_price unit category')
			.sort({ name: 1 })
			.lean()
	]);

	// Revenue today
	const today_start = new Date();
	today_start.setHours(0, 0, 0, 0);
	const paid_today = await InvoicesModel.find({ status: 'paid', paid_at: { $gte: today_start } }).lean();
	const today_revenue = paid_today.reduce((s, i) => s + (i.total ?? 0), 0);

	// Pending total
	const pending_invoices = await InvoicesModel.find({ status: { $in: ['draft', 'sent', 'overdue'] } }).lean();
	const pending_total = pending_invoices.reduce((s, i) => s + (i.total ?? 0), 0);

	return {
		invoices: JSON.parse(JSON.stringify(invoices_raw)),
		total, page, size, status_filter,
		customers: JSON.parse(JSON.stringify(customers_raw)),
		inventory: JSON.parse(JSON.stringify(inventory_raw)),
		today_revenue, pending_total
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();

		const customer_id = fd.get('customer_id') as string;
		const animal_id = fd.get('animal_id') as string;
		const discount_amount = parseFloat(fd.get('discount_amount') as string) || 0;
		const due_date_str = fd.get('due_date') as string;
		const notes = (fd.get('notes') as string)?.trim() ?? '';

		// Service line items
		const svc_descs = fd.getAll('svc_desc[]') as string[];
		const svc_prices = fd.getAll('svc_price[]').map(Number);
		const svc_qtys = fd.getAll('svc_qty[]').map(Number);

		// Inventory line items
		const inv_ids = fd.getAll('inv_id[]') as string[];
		const inv_names = fd.getAll('inv_name[]') as string[];
		const inv_prices = fd.getAll('inv_price[]').map(Number);
		const inv_qtys = fd.getAll('inv_qty[]').map(Number);

		if (!customer_id || !animal_id || !due_date_str) {
			return fail(400, { error: 'Customer, animal and due date are required.' });
		}

		const service_items = svc_descs
			.map((desc, i) => ({
				description: desc, type: 'service' as const,
				quantity: svc_qtys[i] ?? 1, unit_price: svc_prices[i] ?? 0,
				total: (svc_qtys[i] ?? 1) * (svc_prices[i] ?? 0)
			}))
			.filter((i) => i.description && i.unit_price > 0);

		const inventory_items = inv_ids
			.map((id, i) => ({
				description: inv_names[i] ?? '', type: 'inventory' as const,
				quantity: inv_qtys[i] ?? 1, unit_price: inv_prices[i] ?? 0,
				total: (inv_qtys[i] ?? 1) * (inv_prices[i] ?? 0),
				inventory_id: id
			}))
			.filter((i) => i.description && i.unit_price > 0);

		const all_items = [...service_items, ...inventory_items];
		if (all_items.length === 0) return fail(400, { error: 'Add at least one item to the invoice.' });

		const totals = calculateTotals(
			all_items.map((i) => ({ quantity: i.quantity, unit_price: i.unit_price })),
			discount_amount
		);

		const invoice_number = await generateInvoiceNumber();

		const created = await InvoicesModel.create({
			invoice_number, customer_id, animal_id,
			items: all_items, ...totals,
			status: 'draft',
			due_date: new Date(due_date_str),
			notes
		});

		redirect(302, `/u/billing/${created._id}`);
	},

	mark_paid: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const payment_method = fd.get('payment_method') as string;
		if (!id || !payment_method) return fail(400, { error: 'Missing data.' });

		await InvoicesModel.findByIdAndUpdate(id, {
			status: 'paid', payment_method, paid_at: new Date()
		});

		return { success: true };
	}
};
