import mongoose, { Schema } from 'mongoose';

export const consultation_types = [
	'general',
	'specialist',
	'follow-up',
	'emergency',
	'second-opinion'
] as const;
export const consultation_statuses = [
	'scheduled',
	'in-progress',
	'completed',
	'cancelled',
	'no-show'
] as const;

const ConsultationsSchema = new Schema(
	{
		// Relations
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },

		// Appointment link (optional - can be standalone)
		appointment_id: { type: Schema.Types.ObjectId, ref: 'appointments' },

		// Consultation details
		type: {
			type: Schema.Types.String,
			enum: consultation_types,
			required: true,
			default: 'general'
		},
		status: {
			type: Schema.Types.String,
			enum: consultation_statuses,
			required: true,
			default: 'scheduled'
		},
		scheduled_at: { type: Schema.Types.Date, required: true },
		completed_at: { type: Schema.Types.Date },

		veterinarian: { type: Schema.Types.String, required: true, trim: true },

		// Clinical notes
		chief_complaint: { type: Schema.Types.String, required: true, trim: true },
		history: { type: Schema.Types.String, default: '', trim: true },
		physical_exam: { type: Schema.Types.String, default: '', trim: true },
		diagnosis: { type: Schema.Types.String, default: '', trim: true },
		treatment_plan: { type: Schema.Types.String, default: '', trim: true },
		notes: { type: Schema.Types.String, default: '', trim: true },

		// Vital signs
		vital_signs: {
			temperature_c: { type: Schema.Types.Number },
			heart_rate_bpm: { type: Schema.Types.Number },
			respiratory_rate: { type: Schema.Types.Number },
			weight_kg: { type: Schema.Types.Number },
			blood_pressure: { type: Schema.Types.String }
		},

		// Follow-up
		follow_up_date: { type: Schema.Types.Date },
		follow_up_notes: { type: Schema.Types.String, default: '' },

		// Billing
		service_fee: { type: Schema.Types.Number, default: 0 },
		invoice_id: { type: Schema.Types.ObjectId, ref: 'invoices' },

		// Meta
		archived: { type: Schema.Types.Boolean, default: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const ConsultationsModel =
	mongoose.models.consultations || mongoose.model('consultations', ConsultationsSchema);
export default ConsultationsModel;
