import { Schema } from 'mongoose';
import { db as _db } from '../db/easyvet_dbconn';

const db = await _db.connect();

export const inventory_categories = [
	'medicine',
	'vaccine',
	'supply',
	'equipment',
	'food',
	'grooming'
] as const;

const InventorySchema = new Schema(
	{
		name: { type: Schema.Types.String, required: true, trim: true },
		sku: { type: Schema.Types.String, required: true, unique: true, uppercase: true, trim: true },
		category: { type: Schema.Types.String, enum: inventory_categories, required: true },
		description: { type: Schema.Types.String, default: '', trim: true },

		// Stock
		quantity: { type: Schema.Types.Number, required: true, default: 0, min: 0 },
		reorder_level: { type: Schema.Types.Number, default: 5 },
		unit: { type: Schema.Types.String, default: 'piece', trim: true }, // tablet, ml, piece, etc.

		// Pricing
		unit_price: { type: Schema.Types.Number, required: true, min: 0 },
		cost_price: { type: Schema.Types.Number, default: 0, min: 0 },

		// Meta
		expiration_date: { type: Schema.Types.Date },
		supplier: { type: Schema.Types.String, default: '', trim: true },
		location: { type: Schema.Types.String, default: '', trim: true }, // shelf/bin

		// Admin
		archived: { type: Schema.Types.Boolean, default: false },
		last_restocked: { type: Schema.Types.Date },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

// Text index for reactive search
InventorySchema.index({ name: 'text', sku: 'text', description: 'text' });

const InventoryModel = db.models.inventory || db.model('inventory', InventorySchema);
export default InventoryModel;
