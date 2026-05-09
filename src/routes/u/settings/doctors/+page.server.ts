import type { PageServerLoad, Actions } from './$types';
import DoctorsModel from '$lib/server/models/doctors.model';
import { logActivity } from '$lib/server/activity-log';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page   = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size   = Math.min(50, Number(url.searchParams.get('size')) || 20);
	const search = url.searchParams.get('q')?.trim() ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (search) {
		const re = { $regex: search, $options: 'i' };
		query.$or = [{ firstname: re }, { lastname: re }, { email: re }, { license_number: re }];
	}

	const [doctors_raw, total] = await Promise.all([
		DoctorsModel.find(query).sort({ firstname: 1 }).skip((page - 1) * size).limit(size).lean(),
		DoctorsModel.countDocuments(query)
	]);

	return { doctors: JSON.parse(JSON.stringify(doctors_raw)), total, page, size, search };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const firstname       = (fd.get('firstname') as string)?.trim();
		const lastname        = (fd.get('lastname') as string)?.trim();
		const email           = (fd.get('email') as string)?.trim().toLowerCase();
		const license_number  = (fd.get('license_number') as string)?.trim();
		const specialization  = (fd.get('specialization') as string) ?? 'general-practice';
		const phone           = (fd.get('phone') as string)?.trim() ?? '';
		const bio             = (fd.get('bio') as string)?.trim() ?? '';

		if (!firstname || !lastname || !email || !license_number) {
			return fail(400, { error: 'First name, last name, email, and license number are required.' });
		}

		const exists = await DoctorsModel.findOne({ license_number });
		if (exists) return fail(400, { error: 'A doctor with this license number already exists.' });

		const doctor = await DoctorsModel.create({
			firstname, lastname, email, license_number, specialization, phone, bio
		});

		await logActivity({
			category: 'doctor', action: 'created',
			description: `Doctor profile created: Dr. ${firstname} ${lastname} (${specialization})`,
			target_id: doctor._id.toString(), target_label: `Dr. ${firstname} ${lastname}`,
			level: 'success'
		});

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd = await request.formData();
		const id     = fd.get('id') as string;
		const status = fd.get('status') as string;
		if (!id || !status) return fail(400, { error: 'Missing data.' });

		const doctor = await DoctorsModel.findByIdAndUpdate(id, { status }, { new: true });
		if (!doctor) return fail(404, { error: 'Doctor not found.' });

		await logActivity({
			category: 'doctor', action: 'updated',
			description: `Dr. ${doctor.firstname} ${doctor.lastname} status: ${status}`,
			target_id: id, target_label: `Dr. ${doctor.firstname} ${doctor.lastname}`,
			level: status === 'inactive' ? 'warning' : 'info'
		});

		return { success: true };
	},

	update_notifications: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID.' });

		await DoctorsModel.findByIdAndUpdate(id, {
			notify_appointments: fd.get('notify_appointments') === 'on',
			notify_surgeries:    fd.get('notify_surgeries')    === 'on',
			notify_lab_results:  fd.get('notify_lab_results')  === 'on',
			notify_admissions:   fd.get('notify_admissions')   === 'on'
		});

		return { success: true };
	},

	archive: async ({ request }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID.' });

		const doctor = await DoctorsModel.findByIdAndUpdate(id, { archived: true });
		if (!doctor) return fail(404, { error: 'Doctor not found.' });

		await logActivity({
			category: 'doctor', action: 'archived',
			description: `Doctor profile archived: Dr. ${doctor.firstname} ${doctor.lastname}`,
			target_id: id, target_label: `Dr. ${doctor.firstname} ${doctor.lastname}`,
			level: 'warning'
		});

		return { success: true };
	}
};
