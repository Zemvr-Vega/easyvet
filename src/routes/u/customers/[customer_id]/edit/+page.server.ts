import type { PageServerLoad, Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import Customer from '$lib/validation/customers.zod';
import CustomersModel from '$lib/server/models/customers.model';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const customer = await CustomersModel.findOne({
		_id: params.customer_id,
		archived: false
	}).lean();

	if (!customer) error(404, 'Customer not found.');

	// Pre-populate form with existing data
	const form = await superValidate(
		{
			firstname: customer.firstname,
			middlename: customer.middlename ?? undefined,
			lastname: customer.lastname,
			birthdate: customer.birthdate ?? undefined,
			sex: customer.sex,
			address_province: customer.address_province,
			address_city: customer.address_city,
			address_barangay: customer.address_barangay ?? undefined,
			address_line: customer.address_line ?? undefined,
			address_house_number: customer.address_house_number ?? undefined,
			contact_number: customer.contact_number ?? undefined,
			email: customer.email ?? undefined
		},
		zod4(Customer.NewSchema)
	);

	return { form, customer_id: params.customer_id };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await superValidate(request, zod4(Customer.NewSchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please fix the errors below.' }, { status: 400 });
		}

		// Check email conflict with OTHER customers
		if (form.data.email) {
			const conflict = await CustomersModel.findOne({
				email: form.data.email,
				archived: false,
				_id: { $ne: params.customer_id }
			});
			if (conflict) {
				form.errors.email = ['This email is already used by another customer.'];
				return message(form, { type: 'error', text: 'Email conflict.' }, { status: 400 });
			}
		}

		await CustomersModel.findByIdAndUpdate(params.customer_id, {
			...form.data,
			birthdate: form.data.birthdate ?? undefined
		});

		redirect(302, `/u/customers/${params.customer_id}`);
	}
};
