import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

export const surgery_types = [
	'spay',
	'neuter',
	'mass-removal',
	'wound-repair',
	'fracture-repair',
	'dental-extraction',
	'foreign-body-removal',
	'exploratory-laparotomy',
	'caesarean',
	'eye-surgery',
	'ear-surgery',
	'orthopedic',
	'other'
] as const;

export const anesthesia_types = [
	'local',
	'general-injectable',
	'general-inhalant',
	'epidural',
	'none'
] as const;

export const surgery_statuses = [
	'scheduled',
	'prep',
	'in-progress',
	'completed',
	'cancelled',
	'postponed'
] as const;

const SurgeriesSchema = new Schema(
	{
		// Relations
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },

		// Surgery details
		type: { type: Schema.Types.String, enum: surgery_types, required: true },
		description: { type: Schema.Types.String, required: true, trim: true },
		status: { type: Schema.Types.String, enum: surgery_statuses, default: 'scheduled' },

		// Dates & duration
		scheduled_at: { type: Schema.Types.Date, required: true },
		started_at: { type: Schema.Types.Date },
		completed_at: { type: Schema.Types.Date },
		duration_minutes: { type: Schema.Types.Number },

		// Personnel
		surgeon: { type: Schema.Types.String, required: true, trim: true },
		assistant: { type: Schema.Types.String, default: '', trim: true },
		anesthetist: { type: Schema.Types.String, default: '', trim: true },

		// Anesthesia
		anesthesia_type: { type: Schema.Types.String, enum: anesthesia_types, default: 'general-injectable' },
		anesthesia_drugs: [{ type: Schema.Types.String }],
		anesthesia_notes: { type: Schema.Types.String, default: '' },

		// Pre-op
		pre_op_notes: { type: Schema.Types.String, default: '', trim: true },
		fasting_hours: { type: Schema.Types.Number, default: 8 },
		pre_op_weight_kg: { type: Schema.Types.Number },

		// Intra-op
		intra_op_notes: { type: Schema.Types.String, default: '', trim: true },
		complications: { type: Schema.Types.String, default: '', trim: true },

		// Post-op
		post_op_notes: { type: Schema.Types.String, default: '', trim: true },
		discharge_instructions: { type: Schema.Types.String, default: '', trim: true },
		follow_up_date: { type: Schema.Types.Date },
		suture_removal_date: { type: Schema.Types.Date },

		// Consent
		consent_obtained: { type: Schema.Types.Boolean, default: false },
		consent_date: { type: Schema.Types.Date },

		// Billing
		service_fee: { type: Schema.Types.Number, default: 0 },
		invoice_id: { type: Schema.Types.ObjectId, ref: 'invoices' },

		notes: { type: Schema.Types.String, default: '' },

		// Meta
		archived: { type: Schema.Types.Boolean, default: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const SurgeriesModel =
	db.models.surgeries || db.model('surgeries', SurgeriesSchema);
export default SurgeriesModel;
