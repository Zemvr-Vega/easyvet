/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { consultation_types, consultation_statuses } from '$lib/server/models/consultations.model';

namespace Consultation {
	export const Schema = z.object({
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		animal_id: z.string().min(1, 'Animal is required.'),
		customer_id: z.string().min(1, 'Customer is required.'),
		appointment_id: z.string().optional(),

		type: z.enum(consultation_types).default('general'),
		status: z.enum(consultation_statuses).default('scheduled'),

		scheduled_at: z.date({ error: 'Scheduled date is required.' }),
		completed_at: z.date().optional(),

		veterinarian: z
			.string()
			.trim()
			.min(2, 'Veterinarian name is required.')
			.max(100, 'Name too long.'),

		chief_complaint: z
			.string()
			.trim()
			.min(2, 'Chief complaint is required.')
			.max(500, 'Too long.'),

		history: z.string().trim().max(2000).optional(),
		physical_exam: z.string().trim().max(2000).optional(),
		diagnosis: z.string().trim().max(1000).optional(),
		treatment_plan: z.string().trim().max(2000).optional(),
		notes: z.string().trim().max(2000).optional(),

		vital_signs: z
			.object({
				temperature_c: z.number().min(30).max(45).optional(),
				heart_rate_bpm: z.number().min(1).max(400).optional(),
				respiratory_rate: z.number().min(1).max(100).optional(),
				weight_kg: z.number().min(0.01).max(1000).optional(),
				blood_pressure: z.string().max(30).optional()
			})
			.optional(),

		follow_up_date: z.date().optional(),
		follow_up_notes: z.string().trim().max(500).optional(),

		service_fee: z.number().min(0).default(0)
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });
	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
}

export default Consultation;
