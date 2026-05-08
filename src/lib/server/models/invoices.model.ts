import { Schema } from 'mongoose';
import { db as _db } from '../db/easyvet_dbconn';

const db = await _db.connect();

const InvoiceItemSchema = new Schema({
	description: { type: Schema.Types.String, required: true },
	type: { type: Schema.Types.String, enum: ['service', 'inventory'], required: true },
	quantity: { type: Schema.Types.Number, required: true, default: 1, min: 1 },
	unit_price: { type: Schema.Types.Number, required: true, min: 0 },
	total: { type: Schema.Types.Number, required: true, min: 0 },
	inventory_id: { type: Schema.Types.ObjectId, ref: 'inventory' }
});

export const payment_methods = ['cash', 'card', 'gcash', 'bank_transfer'] as const;
export const invoice_statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;

const InvoicesSchema = new Schema(
	{
		invoice_number: { type: Schema.Types.String, required: true, unique: true },

		// Relations
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		medical_record_id: { type: Schema.Types.ObjectId }, // embedded record id inside animal

		// Line items
		items: { type: [InvoiceItemSchema], default: [] },

		// Totals
		subtotal: { type: Schema.Types.Number, default: 0 },
		discount_amount: { type: Schema.Types.Number, default: 0 },
		tax_amount: { type: Schema.Types.Number, default: 0 },
		total: { type: Schema.Types.Number, default: 0 },

		// Payment
		status: {
			type: Schema.Types.String,
			enum: invoice_statuses,
			default: 'draft'
		},
		payment_method: { type: Schema.Types.String, enum: payment_methods },
		paid_at: { type: Schema.Types.Date },
		due_date: { type: Schema.Types.Date, required: true },

		notes: { type: Schema.Types.String, default: '' },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const InvoicesModel = db.models.invoices || db.model('invoices', InvoicesSchema);
export default InvoicesModel;
