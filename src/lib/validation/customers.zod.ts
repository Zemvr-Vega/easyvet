/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';

namespace Customer {
	//#region SCHEMAS
	export const Schema = z.object({
		// Metadata
		public_id: z
			.uuid('Public ID must be a valid unique ID.')
			.nonempty('Public ID is required.'),

		archived: z.boolean().default(false),

		created_by: z.string(),
		created_at: z.date(),
		updated_at: z.date(),

		// Customer personal information
		firstname: z
			.string('Firstname must contain valid characters.')
			.trim()
			.nonempty('Firstname is required.')
			.min(2, 'Firstname must be at least 2 characters long.')
			.regex(/^[a-zA-Z\s\-']+$/, 'Firstname can only contain letters, spaces, hyphens, and apostrophes.'),

		middlename: z
			.string('Middlename must contain valid characters.')
			.trim()
			.min(2, 'Middlename must be at least 2 characters long.')
			.max(50, 'Middlename must not exceed 50 characters.')
			.regex(/^[a-zA-Z\s\-']+$/, 'Middlename can only contain letters, spaces, hyphens, and apostrophes.')
			.optional(),

		lastname: z
			.string('Lastname must be a valid string.')
			.trim()
			.nonempty('Lastname is required.')
			.min(2, 'Lastname must be at least 2 characters long.')
			.max(50, 'Lastname must not exceed 50 characters.')
			.regex(/^[a-zA-Z\s\-']+$/, 'Lastname can only contain letters, spaces, hyphens, and apostrophes.'),

		birthdate: z
			.date('Birthdate must be a valid date.')
			.refine(
				(date) => {
					const age = new Date().getFullYear() - date.getFullYear();
					return age >= 3;
				},
				{ message: 'Customer must be at least 3 years old.' }
			)
			.refine(
				(date) => {
					const age = new Date().getFullYear() - date.getFullYear();
					return age <= 120;
				},
				{ message: 'Customer cannot be older than 120 years.' }
			)
			.optional(),

		// Customer address information
		address_province: z
			.string('Province must contain valid characters.')
			.trim()
			.nonempty('Province is required.')
			.min(2, 'Province must be at least 2 characters long.')
			.regex(/^[a-zA-Z0-9\s\-']+$/, 'Province name can only contain letters, numbers, spaces, hyphens, and apostrophes.'),


		address_city: z
			.string('City must contain valid characters.')
			.trim()
			.nonempty('City is required.')
			.min(2, 'City must be at least 2 characters long.')
			.regex(/^[a-zA-Z0-9\s\-']+$/, 'City name can only contain letters, numbers, spaces, hyphens, and apostrophes.'),

		address_barangay: z
			.string('Barangay must contain valid characters.')
			.trim()
			.min(2, 'Barangay must be at least 2 characters long.')
			.regex(/^[a-zA-Z0-9\s\-']+$/, 'Barangay can contain letters, numbers, spaces, hyphens, and apostrophes.')
			.optional(),

		address_line: z
			.string('Address line must contain valid characters.')
			.trim()
			.min(2, 'Address line must be at least 2 characters long.')
			.regex(/^[a-zA-Z0-9\s,./#\-']+$/, 'Address line contains invalid characters.')
			.optional(),

		address_house_number: z
			.number('House number must be a valid number.')
			.positive('House number must be a positive number.')
			.int('House number must be an integer.')
			.max(999999, 'House number is too large.')
			.optional(),

		// Contact information
		contact_number: z
			.string('Contact number must be a valid string.')
			.trim()
			.regex(
				/^(\+?63|0)[0-9\s\-()]{8,14}$/,
				'Contact number must be a valid phone number (e.g., +63912345678 or 09123456789).'
			)
			.optional(),

		email: z
			.email('Must be a valid email address.')
			.trim()
			.toLowerCase()
			.optional(),

	});

	export const NewSchema = Schema.omit({ public_id: true, archived: true, created_by: true, created_at: true, updated_at: true });

	export const UpdateSchema = Schema.omit({ archived: true, created_by: true, created_at: true, updated_at: true });

	export const ArchiveSchema = z.object({
		public_ids: z.array(z.string()).min(1, "Requires at least 1 item to archive.")
	});

	export const RestoreSchema = ArchiveSchema;
	//#endregion

	//#region types
	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
	export type Archive = z.infer<typeof ArchiveSchema>;
	export type Restore = z.infer<typeof RestoreSchema>;

	export type Public = Omit<z.infer<typeof Schema>, "created_at" | "updated_at" | "created_by">;
	export type Private = z.infer<typeof Schema>
	//#endregion
}

export default Customer;
