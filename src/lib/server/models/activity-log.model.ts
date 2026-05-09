import mongoose from 'mongoose';

export const activity_categories = [
	'customer',
	'animal',
	'appointment',
	'consultation',
	'vaccination',
	'laboratory',
	'surgery',
	'hospitalization',
	'billing',
	'inventory',
	'user',
	'doctor',
	'system'
] as const;

export const activity_actions = [
	'created',
	'updated',
	'deleted',
	'archived',
	'restored',
	'admitted',
	'discharged',
	'paid',
	'cancelled',
	'completed',
	'administered',
	'scheduled',
	'viewed',
	'exported',
	'login',
	'logout'
] as const;

const ActivityLogSchema = new mongoose.Schema(
	{
		// Who did it
		performed_by: { type: String, default: 'System', trim: true },
		performed_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

		// What happened
		category: { type: String, enum: activity_categories, required: true },
		action: { type: String, enum: activity_actions, required: true },

		// What was affected
		target_id: { type: String }, // any ObjectId as string
		target_label: { type: String }, // human-readable name, e.g. "Buddy (Labrador)"
		description: { type: String, required: true, trim: true },

		// Optional metadata snapshot
		meta: { type: mongoose.Schema.Types.Mixed },

		// Severity / highlight
		level: {
			type: String,
			enum: ['info', 'warning', 'error', 'success'],
			default: 'info'
		},

		ip_address: { type: String, default: '' }
	},
	{ timestamps: true }
);

// Index for efficient queries
ActivityLogSchema.index({ category: 1, createdAt: -1 });
ActivityLogSchema.index({ performed_by_id: 1, createdAt: -1 });

const ActivityLogModel =
	mongoose.models.activity_log || mongoose.model('activity_log', ActivityLogSchema);
export default ActivityLogModel;
