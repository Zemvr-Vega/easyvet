import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

export const vaccination_types = [
	'rabies',
	'dhpp', // Distemper, Hepatitis, Parvovirus, Parainfluenza
	'bordetella',
	'leptospirosis',
	'fvrcp', // Feline: Rhinotracheitis, Calicivirus, Panleukopenia
	'felv', // Feline Leukemia
	'microchip',
	'deworming',
	'flea-tick-treatment',
	'other'
] as const;

export const vaccination_statuses = ['scheduled', 'administered', 'missed', 'cancelled'] as const;

const VaccinationsSchema = new Schema(
	{
		// Relations
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },

		// Vaccine details
		type: { type: Schema.Types.String, enum: vaccination_types, required: true },
		vaccine_name: { type: Schema.Types.String, required: true, trim: true },
		vaccine_brand: { type: Schema.Types.String, default: '', trim: true },
		batch_number: { type: Schema.Types.String, default: '', trim: true },
		manufacturer: { type: Schema.Types.String, default: '', trim: true },

		// Administration
		status: { type: Schema.Types.String, enum: vaccination_statuses, default: 'scheduled' },
		scheduled_date: { type: Schema.Types.Date, required: true },
		administered_date: { type: Schema.Types.Date },
		administered_by: { type: Schema.Types.String, default: '', trim: true },

		// Dosage
		dose_number: { type: Schema.Types.Number, default: 1 }, // e.g., 1st, 2nd, 3rd dose
		dose_ml: { type: Schema.Types.Number }, // dose in ml
		route: { type: Schema.Types.String, default: 'subcutaneous', trim: true }, // subcutaneous, intramuscular, etc.
		site: { type: Schema.Types.String, default: '', trim: true }, // e.g., right shoulder

		// Validity
		expiry_date: { type: Schema.Types.Date }, // vaccine vial expiry
		valid_until: { type: Schema.Types.Date }, // next booster due date
		next_due_date: { type: Schema.Types.Date },

		// Billing
		service_fee: { type: Schema.Types.Number, default: 0 },
		invoice_id: { type: Schema.Types.ObjectId, ref: 'invoices' },

		notes: { type: Schema.Types.String, default: '', trim: true },
		reaction_noted: { type: Schema.Types.String, default: '', trim: true },

		// Meta
		archived: { type: Schema.Types.Boolean, default: false },
		created_by: { type: Schema.Types.ObjectId, ref: 'users' }
	},
	{ timestamps: true }
);

const VaccinationsModel =
	db.models.vaccinations || db.model('vaccinations', VaccinationsSchema);
export default VaccinationsModel;
