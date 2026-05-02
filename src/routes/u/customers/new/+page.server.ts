import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from "sveltekit-superforms"
import { zod4 } from "sveltekit-superforms/adapters"
import Customer from '$lib/validation/customers.zod';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(Customer.NewSchema));
	return { form };
};


export const actions: Actions = {
	new: async ({ request }) => {
		const form = await superValidate(request, zod4(Customer.NewSchema), { id: 'form' });

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', message: 'Form is not valid. Please try again.' },
				{ status: 400 }
			);
		}

		const { data } = form;
		console.log(data);
	}
};
