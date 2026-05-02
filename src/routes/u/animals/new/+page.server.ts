import type { PageServerLoad, Actions } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import Animal from '$lib/validation/animals.zod';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const preselected_customer_id = url.searchParams.get('customer_id') ?? '';

	const [form, customers_raw] = await Promise.all([
		superValidate(zod4(Animal.NewSchema)),
		CustomersModel.find({ archived: false })
			.sort({ firstname: 1 })
			.select('firstname lastname _id')
			.lean()
	]);

	const customers = JSON.parse(JSON.stringify(customers_raw));

	// Pre-fill customer if coming from customer detail page
	if (preselected_customer_id) {
		form.data.customer_id = preselected_customer_id;
	}

	return { form, customers, preselected_customer_id };
};

export const actions: Actions = {
	new: async ({ request }) => {
		const form = await superValidate(request, zod4(Animal.NewSchema));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please fix the errors below.' }, { status: 400 });
		}

		// Verify customer exists
		const customer = await CustomersModel.findOne({
			_id: form.data.customer_id,
			archived: false
		});
		if (!customer) {
			form.errors.customer_id = ['Selected customer not found.'];
			return message(form, { type: 'error', text: 'Customer not found.' }, { status: 400 });
		}

		// Check microchip uniqueness
		if (form.data.microchip_id) {
			const existing = await AnimalsModel.findOne({ microchip_id: form.data.microchip_id });
			if (existing) {
				form.errors.microchip_id = ['This microchip ID is already registered.'];
				return message(form, { type: 'error', text: 'Microchip already in use.' }, { status: 400 });
			}
		}

		const { initial_weight_kg, allergies, ...animal_data } = form.data;

		const created = await AnimalsModel.create({
			...animal_data,
			weight_history: initial_weight_kg
				? [{ weight_kg: initial_weight_kg, recorded_by: 'Registration' }]
				: [],
			allergies: allergies
				? allergies.split(',').map((a) => a.trim()).filter(Boolean)
				: []
		});

		redirect(302, `/u/animals/${created._id}`);
	}
};
