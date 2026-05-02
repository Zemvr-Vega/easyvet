/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { surgery_types, surgery_statuses, anesthesia_types } from '$lib/server/models/surgeries.model';

namespace Surgery {
	export const Schema = z.object({
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		animal_id: z.string().min(1, 'Animal is required.'),
		customer_id: z.string().min(1, 'Customer is required.'),

		type: z.enum(surgery_types, { error: 'Please select a valid surgery type.' }),
		description: z.string().trim().min(2, 'Description is required.').max(500),
		status: z.enum(surgery_statuses).default('scheduled'),

		scheduled_at: z.date({ error: 'Scheduled date/time is required.' }),
		started_at: z.date().optional(),
		completed_at: z.date().optional(),
		duration_minutes: z.number().int().min(1).optional(),

		surgeon: z.string().trim().min(2, 'Surgeon name is required.').max(100),
		assistant: z.string().trim().max(100).optional(),
		anesthetist: z.string().trim().max(100).optional(),

		anesthesia_type: z.enum(anesthesia_types).default('general-injectable'),
		anesthesia_drugs: z.array(z.string()).optional(),
		anesthesia_notes: z.string().trim().max(500).optional(),

		pre_op_notes: z.string().trim().max(2000).optional(),
		fasting_hours: z.number().min(0).max(48).default(8),
		pre_op_weight_kg: z.number().min(0.01).max(1000).optional(),

		intra_op_notes: z.string().trim().max(2000).optional(),
		complications: z.string().trim().max(1000).optional(),

		post_op_notes: z.string().trim().max(2000).optional(),
		discharge_instructions: z.string().trim().max(2000).optional(),
		follow_up_date: z.date().optional(),
		suture_removal_date: z.date().optional(),

		consent_obtained: z.boolean().default(false),

		service_fee: z.number().min(0).default(0),
		notes: z.string().trim().max(1000).optional()
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });
	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
}

export default Surgery;
