import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

export const doctor_specializations = [
	'general-practice',
	'surgery',
	'internal-medicine',
	'dermatology',
	'ophthalmology',
	'dentistry',
	'oncology',
	'cardiology',
	'neurology',
	'orthopedics',
	'emergency-critical-care',
	'exotic-animals',
	'radiology',
	'rehabilitation',
	'other'
] as const;

export const doctor_statuses = ['active', 'on-leave', 'inactive'] as const;

const DoctorsSchema = new Schema(
	{
		firstname:    { type: Schema.Types.String, required: true, trim: true },
		lastname:     { type: Schema.Types.String, required: true, trim: true },
		license_number: { type: Schema.Types.String, required: true, trim: true, unique: true },
		email:        { type: Schema.Types.String, required: true, lowercase: true, trim: true },
		phone:        { type: Schema.Types.String, default: '', trim: true },
		photo_url:    { type: Schema.Types.String, default: '' },

		specialization: {
			type: Schema.Types.String,
			enum: doctor_specializations,
			default: 'general-practice'
		},
		secondary_specializations: [{ type: Schema.Types.String }],

		status:       { type: Schema.Types.String, enum: doctor_statuses, default: 'active' },
		bio:          { type: Schema.Types.String, default: '', trim: true },

		// Schedule: days available (0=Sun … 6=Sat)
		schedule_days: { type: [Schema.Types.Number], default: [1,2,3,4,5] },
		schedule_start: { type: Schema.Types.String, default: '08:00' }, // HH:mm
		schedule_end:   { type: Schema.Types.String, default: '17:00' },

		// Email notification preferences
		notify_appointments: { type: Schema.Types.Boolean, default: true },
		notify_surgeries:    { type: Schema.Types.Boolean, default: true },
		notify_lab_results:  { type: Schema.Types.Boolean, default: true },
		notify_admissions:   { type: Schema.Types.Boolean, default: true },

		// Linked user account (optional)
		user_id: { type: Schema.Types.ObjectId, ref: 'users' },

		archived: { type: Schema.Types.Boolean, default: false }
	},
	{ timestamps: true }
);

const DoctorsModel = db.models.doctors || db.model('doctors', DoctorsSchema);
export default DoctorsModel;
