import type { PageServerLoad, Actions } from './$types';
import UsersModel from '$lib/server/models/users.model';
import { logActivity } from '$lib/server/activity-log';
import { getClientIp } from '$lib/server/rate-limit';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 20);
	const search = url.searchParams.get('q')?.trim() ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (search) {
		const re = { $regex: search, $options: 'i' };
		query.$or = [{ firstname: re }, { lastname: re }, { email: re }];
	}

	const [users_raw, total] = await Promise.all([
		UsersModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * size).limit(size).lean(),
		UsersModel.countDocuments(query)
	]);

	return { users: JSON.parse(JSON.stringify(users_raw)), total, page, size, search };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const firstname = (fd.get('firstname') as string)?.trim();
		const lastname  = (fd.get('lastname')  as string)?.trim();
		const email     = (fd.get('email')     as string)?.trim().toLowerCase();
		const role      = (fd.get('role')      as string) ?? 'receptionist';
		const phone     = (fd.get('phone')     as string)?.trim() ?? '';

		if (!firstname || !lastname || !email) {
			return fail(400, { error: 'First name, last name, and email are required.' });
		}

		const exists = await UsersModel.findOne({ email });
		if (exists) return fail(400, { error: 'A user with this email already exists.' });

		// Default password hash — in production use argon2 hash of a temp password
		const password_hash = `TEMP_MUST_RESET_${Date.now()}`;

		const user = await UsersModel.create({ firstname, lastname, email, role, phone, password_hash });

		await logActivity({
			category: 'user', action: 'created',
			description: `User account created for ${firstname} ${lastname} (${role})`,
			target_id: user._id.toString(), target_label: `${firstname} ${lastname}`,
			level: 'success'
		});

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd = await request.formData();
		const id     = fd.get('id') as string;
		const status = fd.get('status') as string;
		if (!id || !status) return fail(400, { error: 'Missing data.' });

		const user = await UsersModel.findByIdAndUpdate(id, { status }, { new: true });
		if (!user) return fail(404, { error: 'User not found.' });

		await logActivity({
			category: 'user', action: 'updated',
			description: `User ${user.firstname} ${user.lastname} status changed to ${status}`,
			target_id: id, target_label: `${user.firstname} ${user.lastname}`,
			level: status === 'suspended' ? 'warning' : 'info'
		});

		return { success: true };
	},

	update_role: async ({ request }) => {
		const fd = await request.formData();
		const id   = fd.get('id') as string;
		const role = fd.get('role') as string;
		if (!id || !role) return fail(400, { error: 'Missing data.' });

		const user = await UsersModel.findByIdAndUpdate(id, { role }, { new: true });
		if (!user) return fail(404, { error: 'User not found.' });

		await logActivity({
			category: 'user', action: 'updated',
			description: `User ${user.firstname} ${user.lastname} role changed to ${role}`,
			target_id: id, target_label: `${user.firstname} ${user.lastname}`,
			level: 'info'
		});

		return { success: true };
	},

	archive: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID.' });

		const user = await UsersModel.findByIdAndUpdate(id, { archived: true });
		if (!user) return fail(404, { error: 'User not found.' });

		await logActivity({
			category: 'user', action: 'archived',
			description: `User account archived: ${user.firstname} ${user.lastname}`,
			target_id: id, target_label: `${user.firstname} ${user.lastname}`,
			level: 'warning'
		});

		return { success: true };
	}
};
