import type { PageServerLoad, Actions } from './$types';
import UsersModel from '$lib/server/models/users.model';
import { logActivity } from '$lib/server/activity-log';
import { fail } from '@sveltejs/kit';

// In a real app, store these in a Settings collection.
// For simplicity, we aggregate from user preferences and expose toggles.

export const load: PageServerLoad = async () => {
	// Fetch admins who should receive system-level alerts
	const admin_users = await UsersModel.find({ role: 'admin', archived: false, status: 'active' })
		.select('firstname lastname email notify_email notify_appointments notify_low_stock notify_billing')
		.lean();

	return { admin_users: JSON.parse(JSON.stringify(admin_users)) };
};

export const actions: Actions = {
	update_user_prefs: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID.' });

		await UsersModel.findByIdAndUpdate(id, {
			notify_email:        fd.get('notify_email')        === 'on',
			notify_appointments: fd.get('notify_appointments') === 'on',
			notify_low_stock:    fd.get('notify_low_stock')    === 'on',
			notify_billing:      fd.get('notify_billing')      === 'on'
		});

		await logActivity({
			category: 'system', action: 'updated',
			description: 'User notification preferences updated',
			target_id: id, level: 'info'
		});

		return { success: true };
	}
};
