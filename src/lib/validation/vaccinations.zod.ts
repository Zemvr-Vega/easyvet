/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { vaccination_types, vaccination_statuses } from '$lib/server/models/vaccinations.model';

namespace Vaccination {
	export const Schema = z.object({
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		animal_id: z.string().min(1, 'Animal is required.'),
		customer_id: z.string().min(1, 'Customer is required.'),

		type: z.enum(vaccination_types, { error: 'Please select a valid vaccine type.' }),
		vaccine_name: z.string().trim().min(1, 'Vaccine name is required.').max(100),
		vaccine_brand: z.string().trim().max(100).optional(),
		batch_number: z.string().trim().max(50).optional(),
		manufacturer: z.string().trim().max(100).optional(),

		status: z.enum(vaccination_statuses).default('scheduled'),

		scheduled_date: z.date({ error: 'Scheduled date is required.' }),
		administered_date: z.date().optional(),
		administered_by: z.string().trim().max(100).optional(),

		dose_number: z.number().int().min(1).default(1),
		dose_ml: z.number().min(0).optional(),
		route: z.string().trim().max(50).default('subcutaneous'),
		site: z.string().trim().max(100).optional(),

		expiry_date: z.date().optional(),
		valid_until: z.date().optional(),
		next_due_date: z.date().optional(),

		service_fee: z.number().min(0).default(0),
		notes: z.string().trim().max(500).optional(),
		reaction_noted: z.string().trim().max(500).optional()
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });
	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
}

export default Vaccination;
