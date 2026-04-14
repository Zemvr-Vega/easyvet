import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

let db = connectDB;

export const sex_options = {
	MALE: 1,
	FEMALE: 2,
	DID_NOT_INDICATE: 0
} as const;

const CustomersSchema = new Schema({
	// customer information
	firstname: { type: Schema.Types.String, required: true, trim: true },
	middlename: { type: Schema.Types.String, required: false, trim: true },
	lastname: { type: Schema.Types.String, required: true, trim: true },
	birthdate: { type: Schema.Types.Date, required: false },
	sex: {
		type: Schema.Types.Number,
		required: false,
		enum: Object.values(sex_options),
		default: 0
	},

	// customer address
	address_province: { type: Schema.Types.String, required: true, trim: true },
	address_city: { type: Schema.Types.String, required: true, trim: true },
	address_barangay: { type: Schema.Types.String, required: false, trim: true },
	address_line: { type: Schema.Types.String, required: false, trim: true },
	address_house_number: { type: Schema.Types.Number, required: false, trim: true },

	// customer contact info
	contact_number: { type: Schema.Types.String, required: false, trim: true },
	email: { type: Schema.Types.String, required: false, trim: true },

	// others
	archived: { type: Schema.Types.Boolean, required: true, default: false },
	created_by: { type: Schema.Types.ObjectId, ref: 'users' }
});

const CustomersModel = db.models.customers || db.model('customers', CustomersSchema);

export default CustomersModel;
