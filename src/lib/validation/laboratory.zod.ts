/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { lab_test_types, lab_statuses } from '$lib/server/models/laboratory.model';

namespace Laboratory {
	export const Schema = z.object({
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		animal_id: z.string().min(1, 'Animal is required.'),
		customer_id: z.string().min(1, 'Customer is required.'),
		consultation_id: z.string().optional(),

		test_type: z.enum(lab_test_types, { error: 'Please select a valid test type.' }),
		test_name: z.string().trim().min(1, 'Test name is required.').max(100),
		status: z.enum(lab_statuses).default('pending'),

		requested_date: z.date().default(() => new Date()),
		collected_date: z.date().optional(),
		resulted_date: z.date().optional(),

		requested_by: z.string().trim().min(1, 'Requesting veterinarian is required.').max(100),
		performed_by: z.string().trim().max(100).optional(),

		sample_type: z.string().trim().max(50).optional(),
		sample_notes: z.string().trim().max(500).optional(),

		result_summary: z.string().trim().max(2000).optional(),
		result_interpretation: z.string().trim().max(2000).optional(),
		result_file_url: z.string().trim().max(500).optional(),

		service_fee: z.number().min(0).default(0),
		notes: z.string().trim().max(1000).optional()
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });
	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
}

export default Laboratory;
