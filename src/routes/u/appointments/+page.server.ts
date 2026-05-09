import type { PageServerLoad, Actions } from './$types';
import AppointmentsModel from '$lib/server/models/appointments.model';
import AnimalsModel from '$lib/server/models/animals.model';
import CustomersModel from '$lib/server/models/customers.model';
import { logActivity } from '$lib/server/activity-log';
import { notify } from '$lib/server/email';
import { getClientIp } from '$lib/server/rate-limit';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Number(url.searchParams.get('size')) || 15);
	const status_filter = url.searchParams.get('status') ?? '';
	const date_filter = url.searchParams.get('date') ?? '';

	const query: Record<string, unknown> = { archived: false };
	if (status_filter) query.status = status_filter;
	if (date_filter) {
		const d = new Date(date_filter);
		const next = new Date(d);
		next.setDate(next.getDate() + 1);
		query.scheduled_at = { $gte: d, $lt: next };
	}

	const [appointments_raw, total, customers_raw, animals_raw] = await Promise.all([
		AppointmentsModel.find(query)
			.sort({ scheduled_at: 1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('animal_id', 'name species')
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		AppointmentsModel.countDocuments(query),
		CustomersModel.find({ archived: false }).select('firstname lastname _id email').sort({ firstname: 1 }).lean(),
		AnimalsModel.find({ archived: false }).select('name species customer_id _id').sort({ name: 1 }).lean()
	]);

	return {
		appointments: JSON.parse(JSON.stringify(appointments_raw)),
		customers: JSON.parse(JSON.stringify(customers_raw)),
		animals: JSON.parse(JSON.stringify(animals_raw)),
		total, page, size, status_filter, date_filter
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const animal_id    = fd.get('animal_id') as string;
		const customer_id  = fd.get('customer_id') as string;
		const scheduled_at = fd.get('scheduled_at') as string;
		const type         = fd.get('type') as string;
		const veterinarian = (fd.get('veterinarian') as string)?.trim();
		const duration_minutes = parseInt(fd.get('duration_minutes') as string) || 30;
		const notes        = (fd.get('notes') as string)?.trim() ?? '';

		if (!animal_id || !customer_id || !scheduled_at || !type || !veterinarian) {
			return fail(400, { error: 'All required fields must be filled.' });
		}

		const appt = await AppointmentsModel.create({
			animal_id, customer_id, scheduled_at: new Date(scheduled_at),
			type, veterinarian, duration_minutes, notes
		});

		// Fetch names for logging + email
		const [animal, customer] = await Promise.all([
			AnimalsModel.findById(animal_id).select('name').lean(),
			CustomersModel.findById(customer_id).select('firstname lastname email').lean()
		]);

		const animal_name = (animal as any)?.name ?? 'Unknown';
		const owner_name  = customer ? `${(customer as any).firstname} ${(customer as any).lastname}` : 'Unknown';
		const owner_email = (customer as any)?.email;

		await logActivity({
			category: 'appointment', action: 'scheduled',
			description: `Appointment scheduled for ${animal_name} — ${type} with Dr. ${veterinarian}`,
			target_id: appt._id.toString(), target_label: animal_name,
			level: 'success'
		});

		// Send email to owner if they have one
		if (owner_email) {
			notify.appointmentScheduled(owner_email, {
				animal_name, owner_name, doctor_name: veterinarian,
				scheduled_at: new Date(scheduled_at), type, notes
			}).catch(() => {}); // fire-and-forget
		}

		return { success: true };
	},

	update_status: async ({ request }) => {
		const fd     = await request.formData();
		const id     = fd.get('id') as string;
		const status = fd.get('status') as string;
		if (!id || !status) return fail(400, { error: 'Missing data.' });

		await AppointmentsModel.findByIdAndUpdate(id, { status });

		await logActivity({
			category: 'appointment', action: 'updated',
			description: `Appointment status updated to ${status}`,
			target_id: id, level: 'info'
		});

		return { success: true };
	}
};
