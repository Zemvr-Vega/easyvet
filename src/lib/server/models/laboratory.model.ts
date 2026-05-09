import mongoose, { Schema } from 'mongoose';

export const lab_test_types = [
	'cbc', // Complete Blood Count
	'blood-chemistry',
	'urinalysis',
	'fecal-exam',
	'skin-scraping',
	'cytology',
	'culture-sensitivity',
	'heartworm-test',
	'parvo-test',
	'felv-fiv-test',
	'xray',
	'ultrasound',
	'ecg',
	'other'
] as const;

export const lab_statuses = ['pending', 'in-progress', 'completed', 'cancelled'] as const;

const LabResultItemSchema = new Schema({
	parameter: { type: Schema.Types.String, required: true },
	value: { type: Schema.Types.String, required: true },
	unit: { type: Schema.Types.String, default: '' },
	reference_range: { type: Schema.Types.String, default: '' },
	flag: {
		type: Schema.Types.String,
		enum: ['normal', 'high', 'low', 'critical'],
		default: 'normal'
	}
});

const LaboratorySchema = new Schema(
	{
		// Relations
		animal_id: { type: Schema.Types.ObjectId, ref: 'animals', required: true },
		customer_id: { type: Schema.Types.ObjectId, ref: 'customers', required: true },
		consultation_id: { type: Schema.Types.ObjectId, ref: 'consultations' },

		// Test details
		test_type: { type: Schema.Types.String, enum: lab_test_types, required: true },
		test_name: { type: Schema.Types.String, required: true, trim: true },
		status: { type: Schema.Types.String, enum: lab_statuses, default: 'pending' },

		// Dates
		requested_date: { type: Schema.Types.Date, required: true, default: Date.now },
		collected_date: { type: Schema.Types.Date },
		resulted_date: { type: Schema.Types.Date },

		requested_by: { type: Schema.Types.String, required: true, trim: true }, // veterinarian
		performed_by: { type: Schema.Types.String, default: '', trim: true },

		// Sample info
		sample_type: { type: Schema.Types.String, default: '', trim: true }, // blood, urine, stool
		sample_notes: { type: Schema.Types.String, default: '' },

		// Results
		result_items: { type: [LabResultItemSchema], default: [] },
		result_summary: { type: Schema.Types.String, default: '', trim: true },
		result_interpretation: { type: Schema.Types.String, default: '', trim: true },
		result_file_url: { type: Schema.Types.String, default: '' }, // uploaded result image/pdf

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

const LaboratoryModel =
	mongoose.models.laboratory || mongoose.model('laboratory', LaboratorySchema);
export default LaboratoryModel;
