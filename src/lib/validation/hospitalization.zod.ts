/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { hospitalization_reasons, hospitalization_statuses } from '$lib/server/models/hospitalization.model';

namespace Hospitalization {
	export const Schema = z.object({
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		animal_id: z.string().min(1, 'Animal is required.'),
		customer_id: z.string().min(1, 'Customer is required.'),
		surgery_id: z.string().optional(),
		consultation_id: z.string().optional(),

		reason: z.enum(hospitalization_reasons, { error: 'Please select a reason.' }),
		reason_detail: z.string().trim().min(2, 'Reason detail is required.').max(500),
		status: z.enum(hospitalization_statuses).default('admitted'),

		ward: z.string().trim().max(50).default('general'),
		cage_number: z.string().trim().max(20).optional(),

		admitted_at: z.date().default(() => new Date()),
		expected_discharge: z.date().optional(),
		discharged_at: z.date().optional(),

		attending_vet: z.string().trim().min(2, 'Attending veterinarian is required.').max(100),

		admission_notes: z.string().trim().max(2000).optional(),
		treatment_notes: z.string().trim().max(2000).optional(),
		diet_instructions: z.string().trim().max(500).optional(),
		medications: z.array(z.string()).optional(),
		discharge_notes: z.string().trim().max(2000).optional(),
		discharge_instructions: z.string().trim().max(2000).optional(),

		daily_rate: z.number().min(0).default(0)
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });
	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	// For adding progress notes
	export const ProgressNoteSchema = z.object({
		hospitalization_id: z.string().min(1),
		noted_by: z.string().trim().min(1, 'Noted by is required.'),
		note: z.string().trim().min(1, 'Note is required.').max(2000),
		temperature_c: z.number().min(30).max(45).optional(),
		heart_rate_bpm: z.number().min(1).max(400).optional(),
		respiratory_rate: z.number().min(1).max(100).optional(),
		weight_kg: z.number().min(0.01).max(1000).optional()
	});

	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
	export type ProgressNote = z.infer<typeof ProgressNoteSchema>;
}

export default Hospitalization;
