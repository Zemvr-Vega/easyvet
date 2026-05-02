import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const WeightEntrySchema = new Schema(
	{
		weight_kg: { type: Schema.Types.Number, required: true },
		recorded_by: { type: Schema.Types.String, required: true, trim: true }
	},
	{ timestamps: true }
);

const VitalSignsSchema = new Schema({
	temperature_c: { type: Schema.Types.Number },
	heart_rate_bpm: { type: Schema.Types.Number },
	respiratory_rate: { type: Schema.Types.Number },
	blood_pressure: { type: Schema.Types.String }
});

const InventoryUsedSchema = new Schema({
	inventory_id: { type: Schema.Types.ObjectId, ref: 'inventory', required: true },
	item_name: { type: Schema.Types.String, required: true },
	quantity: { type: Schema.Types.Number, required: true },
	unit_price: { type: Schema.Types.Number, required: true }
});

const MedicalRecordSchema = new Schema(
	{
		visit_type: {
			type: Schema.Types.String,
			enum: ['checkup', 'vaccination', 'surgery', 'emergency', 'dental', 'follow-up', 'grooming'],
			required: true
		},
		chief_complaint: { type: Schema.Types.String, required: true, trim: true },
		diagnosis: { type: Schema.Types.String, default: '', trim: true },
		treatment: { type: Schema.Types.String, default: '', trim: true },
		prescriptions: [{ type: Schema.Types.String }],
		vital_signs: { type: VitalSignsSchema, default: {} },
		inventory_used: [InventoryUsedSchema],
		service_fee: { type: Schema.Types.Number, default: 0 },
		notes: { type: Schema.Types.String, default: '' },
		veterinarian: { type: Schema.Types.String, required: true, trim: true },
		next_visit_date: { type: Schema.Types.Date }
	},
	{ timestamps: true }
);

// ── Main schema ────────────────────────────────────────────────────────────────

export const species_options = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'other'] as const;
export const sex_options = { MALE: 'male', FEMALE: 'female', UNKNOWN: 'unknown' } as const;
export const vaccination_options = {
	UP_TO_DATE: 'up-to-date',
	OVERDUE: 'overdue',
	UNKNOWN: 'unknown'
} as const;

const AnimalsSchema = new Schema(
	{
		// Core identity
		name: { type: Schema.Types.String, required: true, trim: true },
		species: { type: Schema.Types.String, enum: species_options, required: true },
		breed: { type: Schema.Types.String, required: true, trim: true },
		dob: { type: Schema.Types.Date, required: true },
		sex: {
			type: Schema.Types.String,
			enum: Object.values(sex_options),
			default: sex_options.UNKNOWN
		},
		color: { type: Schema.Types.String, trim: true, default: '' },
		microchip_id: { type: Schema.Types.String, sparse: true, unique: true, trim: true },
		is_neutered: { type: Schema.Types.Boolean, default: false },

		// Relations
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },

		// Health tracking
		weight_history: { type: [WeightEntrySchema], default: [] },
		medical_records: { type: [MedicalRecordSchema], default: [] },
		allergies: { type: [Schema.Types.String], default: [] },
		vaccination_status: {
			type: Schema.Types.String,
			enum: Object.values(vaccination_options),
			default: vaccination_options.UNKNOWN
		},

		// Admin
		archived: { type: Schema.Types.Boolean, default: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const AnimalsModel = db.models.animals || db.model('animals', AnimalsSchema);
export default AnimalsModel;
