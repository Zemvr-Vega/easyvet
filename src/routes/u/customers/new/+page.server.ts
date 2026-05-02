import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import Customer from '$lib/validation/customers.zod';
import CustomersModel from '$lib/server/models/customers.model';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(Customer.NewSchema));
	return { form };
};

export const actions: Actions = {
	new: async ({ request }) => {
		const form = await superValidate(request, zod4(Customer.NewSchema), { id: 'form' });

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please fix the errors below.' }, { status: 400 });
		}

		if (form.data.email) {
			const existing = await CustomersModel.findOne({ email: form.data.email, archived: false });
			if (existing) {
				form.errors.email = ['A customer with this email already exists.'];
				return message(form, { type: 'error', text: 'Email already in use.' }, { status: 400 });
			}
		}

		const created = await CustomersModel.create({
			...form.data,
			birthdate: form.data.birthdate ?? undefined
		});

		redirect(302, `/u/customers/${created._id}`);
	}
};
