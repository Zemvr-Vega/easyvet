import { Schema } from 'mongoose';
import connectDB from '../db/easyvet_dbconn';

const db = connectDB;

export const user_roles = ['admin', 'veterinarian', 'receptionist', 'technician', 'viewer'] as const;
export const user_statuses = ['active', 'inactive', 'suspended'] as const;

const UsersSchema = new Schema(
	{
		firstname: { type: Schema.Types.String, required: true, trim: true },
		lastname:  { type: Schema.Types.String, required: true, trim: true },
		email:     { type: Schema.Types.String, required: true, unique: true, lowercase: true, trim: true },
		password_hash: { type: Schema.Types.String, required: true },

		role:   { type: Schema.Types.String, enum: user_roles,    default: 'receptionist' },
		status: { type: Schema.Types.String, enum: user_statuses, default: 'active' },

		phone: { type: Schema.Types.String, default: '' },
		avatar_url: { type: Schema.Types.String, default: '' },

		// Notification preferences
		notify_email: { type: Schema.Types.Boolean, default: true },
		notify_appointments: { type: Schema.Types.Boolean, default: true },
		notify_low_stock:    { type: Schema.Types.Boolean, default: true },
		notify_billing:      { type: Schema.Types.Boolean, default: false },

		last_login_at: { type: Schema.Types.Date },
		archived: { type: Schema.Types.Boolean, default: false }
	},
	{ timestamps: true }
);

const UsersModel = db.models.users || db.model('users', UsersSchema);
export default UsersModel;
