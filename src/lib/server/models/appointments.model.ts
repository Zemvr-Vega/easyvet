import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

export const appointment_types = [
	'checkup',
	'vaccination',
	'surgery',
	'emergency',
	'dental',
	'follow-up',
	'grooming',
	'laboratory'
] as const;

export const appointment_statuses = [
	'scheduled',
	'confirmed',
	'in-progress',
	'completed',
	'cancelled',
	'no-show'
] as const;

const AppointmentsSchema = new Schema(
	{
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },

		scheduled_at: { type: Schema.Types.Date, required: true },
		duration_minutes: { type: Schema.Types.Number, default: 30 },

		type: { type: Schema.Types.String, enum: appointment_types, required: true },
		status: {
			type: Schema.Types.String,
			enum: appointment_statuses,
			default: 'scheduled'
		},

		veterinarian: { type: Schema.Types.String, required: true, trim: true },
		notes: { type: Schema.Types.String, default: '' },
		reminder_sent: { type: Schema.Types.Boolean, default: false },

		archived: { type: Schema.Types.Boolean, default: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const AppointmentsModel =
	db.models.appointments || db.model('appointments', AppointmentsSchema);
export default AppointmentsModel;
