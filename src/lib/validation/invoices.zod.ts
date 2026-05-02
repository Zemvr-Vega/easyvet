/* eslint-disable @typescript-eslint/no-namespace */
import z from 'zod/v4';
import { payment_methods, invoice_statuses } from '$lib/server/models/invoices.model';

namespace Invoice {
	const InvoiceItemSchema = z.object({
		description: z.string().trim().min(1, 'Description is required.'),
		type: z.enum(['service', 'inventory']),
		quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
		unit_price: z.number().min(0),
		total: z.number().min(0),
		inventory_id: z.string().optional()
	});

	//#region SCHEMAS
	export const Schema = z.object({
		customer_id: z.string().min(1, 'Customer is required.'),
		animal_id: z.string().min(1, 'Animal is required.'),
		medical_record_id: z.string().optional(),

		items: z.array(InvoiceItemSchema).min(1, 'At least one item is required.'),

		subtotal: z.number().min(0),
		discount_amount: z.number().min(0).default(0),
		tax_amount: z.number().min(0).default(0),
		total: z.number().min(0),

		status: z.enum(invoice_statuses).default('draft'),
		payment_method: z.enum(payment_methods).optional(),

		due_date: z.date({ error: 'Due date is required.' }),
		notes: z.string().trim().max(500).optional()
	});

	export const NewSchema = Schema.omit({ subtotal: true, tax_amount: true, total: true });

	export const MarkPaidSchema = z.object({
		invoice_id: z.string().min(1),
		payment_method: z.enum(payment_methods)
	});

	//#endregion

	//#region TYPES
	export type New = z.infer<typeof NewSchema>;
	export type MarkPaid = z.infer<typeof MarkPaidSchema>;
	export type Item = z.infer<typeof InvoiceItemSchema>;
	//#endregion
}

export default Invoice;
