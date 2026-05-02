import type { PageServerLoad, Actions } from './$types';
import InvoicesModel from '$lib/server/models/invoices.model';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const invoice_raw = await InvoicesModel.findById(params.invoice_id)
		.populate('customer_id', 'firstname lastname contact_number email address_city address_province')
		.populate('animal_id', 'name species breed')
		.lean();

	if (!invoice_raw) error(404, 'Invoice not found.');

	return { invoice: JSON.parse(JSON.stringify(invoice_raw)) };
};

export const actions: Actions = {
	mark_paid: async ({ request, params }) => {
		const fd = await request.formData();
		const payment_method = fd.get('payment_method') as string;
		if (!payment_method) return fail(400, { error: 'Payment method required.' });

		await InvoicesModel.findByIdAndUpdate(params.invoice_id, {
			status: 'paid',
			payment_method,
			paid_at: new Date()
		});

		return { success: true };
	},

	cancel: async ({ params }) => {
		await InvoicesModel.findByIdAndUpdate(params.invoice_id, { status: 'cancelled' });
		return { success: true };
	}
};
