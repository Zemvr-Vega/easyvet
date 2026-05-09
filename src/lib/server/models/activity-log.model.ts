import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

export const activity_categories = [
	'customer', 'animal', 'appointment', 'consultation', 'vaccination',
	'laboratory', 'surgery', 'hospitalization', 'billing', 'inventory',
	'user', 'doctor', 'system'
] as const;

export const activity_actions = [
	'created', 'updated', 'deleted', 'archived', 'restored',
	'admitted', 'discharged', 'paid', 'cancelled', 'completed',
	'administered', 'scheduled', 'viewed', 'exported', 'login', 'logout'
] as const;

const ActivityLogSchema = new Schema(
	{
		// Who did it
		performed_by: { type: Schema.Types.String, default: 'System', trim: true },
		performed_by_id: { type: Schema.Types.ObjectId, ref: 'users' },

		// What happened
		category: { type: Schema.Types.String, enum: activity_categories, required: true },
		action:   { type: Schema.Types.String, enum: activity_actions,    required: true },

		// What was affected
		target_id:   { type: Schema.Types.String }, // any ObjectId as string
		target_label: { type: Schema.Types.String }, // human-readable name, e.g. "Buddy (Labrador)"
		description: { type: Schema.Types.String, required: true, trim: true },

		// Optional metadata snapshot
		meta: { type: Schema.Types.Mixed },

		// Severity / highlight
		level: {
			type: Schema.Types.String,
			enum: ['info', 'warning', 'error', 'success'],
			default: 'info'
		},

		ip_address: { type: Schema.Types.String, default: '' }
	},
	{ timestamps: true }
);

// Index for efficient queries
ActivityLogSchema.index({ category: 1, createdAt: -1 });
ActivityLogSchema.index({ performed_by_id: 1, createdAt: -1 });

const ActivityLogModel = db.models.activity_log || db.model('activity_log', ActivityLogSchema);
export default ActivityLogModel;
