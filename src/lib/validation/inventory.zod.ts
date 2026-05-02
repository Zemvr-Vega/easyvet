/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { inventory_categories } from '$lib/server/models/inventory.model';

namespace Inventory {
	//#region SCHEMAS
	export const Schema = z.object({
		archived: z.boolean().default(false),
		created_by: z.string().optional(),

		name: z
			.string()
			.trim()
			.min(1, 'Item name is required.')
			.max(100, 'Name must not exceed 100 characters.'),

		sku: z
			.string()
			.trim()
			.min(1, 'SKU is required.')
			.max(30, 'SKU must not exceed 30 characters.')
			.toUpperCase(),

		category: z.enum(inventory_categories, { error: 'Please select a valid category.' }),

		description: z.string().trim().max(300).optional(),

		quantity: z
			.number({ error: 'Quantity must be a number.' })
			.int('Quantity must be a whole number.')
			.min(0, 'Quantity cannot be negative.'),

		reorder_level: z
			.number({ error: 'Reorder level must be a number.' })
			.int()
			.min(0)
			.default(5),

		unit: z.string().trim().min(1).max(20).default('piece'),

		unit_price: z
			.number({ error: 'Unit price must be a number.' })
			.min(0, 'Price cannot be negative.'),

		cost_price: z
			.number({ error: 'Cost price must be a number.' })
			.min(0)
			.optional(),

		expiration_date: z
			.date({ error: 'Expiration date must be a valid date.' })
			.refine((d) => d > new Date(), { message: 'Expiration date must be in the future.' })
			.optional(),

		supplier: z.string().trim().max(100).optional(),
		location: z.string().trim().max(60).optional()
	});

	export const NewSchema = Schema.omit({ archived: true, created_by: true });
	export const UpdateSchema = Schema.partial().omit({ created_by: true });

	//#endregion

	//#region TYPES
	export type New = z.infer<typeof NewSchema>;
	export type Update = z.infer<typeof UpdateSchema>;
	//#endregion
}

export default Inventory;
