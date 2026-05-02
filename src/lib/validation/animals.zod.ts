/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { species_options, sex_options, vaccination_options } from '$lib/server/models/animals.model';

namespace Animal {
	//#region SCHEMAS
	export const Schema = z.object({
		// Metadata
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		// Core identity
		name: z
			.string()
			.trim()
			.min(1, 'Animal name is required.')
			.max(60, 'Name must not exceed 60 characters.'),

		species: z.enum(species_options, { error: 'Please select a valid species.' }),

		breed: z
			.string()
			.trim()
			.min(1, 'Breed is required.')
			.max(80, 'Breed must not exceed 80 characters.'),

		dob: z.date({ error: 'Date of birth must be a valid date.' }).refine(
			(d) => d <= new Date(),
			{ message: 'Date of birth cannot be in the future.' }
		),

		sex: z.enum(Object.values(sex_options) as [string, ...string[]]).default(sex_options.UNKNOWN),

		color: z.string().trim().max(60).optional(),

		microchip_id: z
			.string()
			.trim()
			.max(30)
			.regex(/^[A-Za-z0-9\-]*$/, 'Microchip ID can only contain letters, numbers, and hyphens.')
			.optional(),

		is_neutered: z.boolean().default(false),

		// Relation
		customer_id: z.string().min(1, 'Owner (customer) is required.'),

		// Health
		initial_weight_kg: z
			.number({ error: 'Weight must be a number.' })
			.positive('Weight must be positive.')
			.max(500, 'Weight seems too large.')
			.optional(),

		allergies: z.string().trim().optional(), // comma-separated, split on server

		vaccination_status: z
			.enum(Object.values(vaccination_options) as [string, ...string[]])
			.default(vaccination_options.UNKNOWN)
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });

	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	//#endregion

	//#region TYPES
	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
	//#endregion
}

export default Animal;
