import mongoose, { Schema } from 'mongoose';

export const hospitalization_reasons = [
	'post-surgery',
	'critical-care',
	'observation',
	'fluid-therapy',
	'infection',
	'toxicity',
	'respiratory-distress',
	'trauma',
	'birthing',
	'other'
] as const;

export const hospitalization_statuses = [
	'admitted',
	'stable',
	'critical',
	'improving',
	'discharged',
	'transferred',
	'deceased'
] as const;

const ProgressNoteSchema = new Schema(
	{
		noted_by: { type: Schema.Types.String, required: true },
		note: { type: Schema.Types.String, required: true },
		vital_signs: {
			temperature_c: { type: Schema.Types.Number },
			heart_rate_bpm: { type: Schema.Types.Number },
			respiratory_rate: { type: Schema.Types.Number },
			weight_kg: { type: Schema.Types.Number }
		}
	},
	{ timestamps: true }
);

const HospitalizationSchema = new Schema(
	{
		// Relations
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
		surgery_id: { type: Schema.Types.ObjectId, ref: 'surgeries' }, // if post-surgery
		consultation_id: { type: Schema.Types.ObjectId, ref: 'consultations' },

		// Admission
		reason: { type: Schema.Types.String, enum: hospitalization_reasons, required: true },
		reason_detail: { type: Schema.Types.String, required: true, trim: true },
		status: { type: Schema.Types.String, enum: hospitalization_statuses, default: 'admitted' },
		ward: { type: Schema.Types.String, default: 'general', trim: true }, // cage/ward location
		cage_number: { type: Schema.Types.String, default: '', trim: true },

		// Dates
		admitted_at: { type: Schema.Types.Date, required: true, default: Date.now },
		discharged_at: { type: Schema.Types.Date },
		expected_discharge: { type: Schema.Types.Date },

		// Attending
		attending_vet: { type: Schema.Types.String, required: true, trim: true },

		// Clinical
		admission_notes: { type: Schema.Types.String, default: '' },
		treatment_notes: { type: Schema.Types.String, default: '' },
		diet_instructions: { type: Schema.Types.String, default: '' },
		medications: [{ type: Schema.Types.String }],
		discharge_notes: { type: Schema.Types.String, default: '' },
		discharge_instructions: { type: Schema.Types.String, default: '' },

		// Progress notes (daily updates)
		progress_notes: { type: [ProgressNoteSchema], default: [] },

		// Billing (per day rate)
		daily_rate: { type: Schema.Types.Number, default: 0 },
		total_days: { type: Schema.Types.Number, default: 0 },
		invoice_id: { type: Schema.Types.ObjectId, ref: 'invoices' },

		// Meta
		archived: { type: Schema.Types.Boolean, default: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const HospitalizationModel =
	mongoose.models.hospitalization || mongoose.model('hospitalization', HospitalizationSchema);
export default HospitalizationModel;
