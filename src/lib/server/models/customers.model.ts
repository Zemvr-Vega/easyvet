import mongoose, { Schema } from 'mongoose';
import { v4 } from 'uuid';

const CustomersSchema = new Schema(
	{
		// metadata
		public_id: {
			type: String,
			required: true,
			default: v4,
			immutable: true,
			unique: true
		},
		archived: { type: Boolean, required: true, default: false },
		// temporary created_by field for dev
		created_by: { type: String, default: 'dev' },
		// created_by: { type: Schema.Types.ObjectId, ref: 'users' },

		// customer information
		firstname: { type: String, required: true, trim: true },
		middlename: { type: String, required: false, trim: true },
		lastname: { type: String, required: true, trim: true },
		birthdate: { type: Date, required: false },
		sex: {
			type: String,
			required: false,
			enum: ['male', 'female']
		},

		// customer address
		address_province: { type: String, required: true, trim: true },
		address_city: { type: String, required: true, trim: true },
		address_barangay: { type: String, required: false, trim: true },
		address_line: { type: String, required: false, trim: true },
		address_house_number: { type: Number, required: false, trim: true },

		// customer contact info
		contact_number: { type: String, required: false, trim: true },
		email: { type: String, required: false, trim: true }
	},
	{
		// model options
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		collection: 'customers',
		versionKey: false
	}
);

const CustomersModel = mongoose.models.customers || mongoose.model('customers', CustomersSchema);

export default CustomersModel;
