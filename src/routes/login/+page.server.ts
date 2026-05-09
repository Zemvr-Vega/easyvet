import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, parseSession, encodeSession } from '$lib/server/session';

interface UserDoc {
	_id:           { toString(): string };
	email:         string;
	firstname:     string;
	lastname:      string;
	role:          string;
	status:        'active' | 'inactive' | 'suspended';
	password_hash: string;
	archived:      boolean;
}

// ── Load ──────────────────────────────────────────────────────────────────────
// No DB imports here — load() only checks the session cookie.
export const load: PageServerLoad = async ({ cookies }) => {
	const raw = cookies.get(SESSION_COOKIE);
	if (!raw) return {};

	const session = parseSession(raw);
	if (session) redirect(302, '/u/dashboard');

	return {};
};

// ── Actions ───────────────────────────────────────────────────────────────────
export const actions: Actions = {
	login: async ({ request, cookies }) => {
		// Lazy-import DB models — keeps them out of module-init scope
		const { default: UsersModel } = await import('$lib/server/models/users.model');
		const { logActivity }         = await import('$lib/server/activity-log');
		const { getClientIp }         = await import('$lib/server/rate-limit');

		const fd       = await request.formData();
		const email    = (fd.get('email')    as string | null)?.trim().toLowerCase() ?? '';
		const password = (fd.get('password') as string | null) ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		// ── Fetch user ────────────────────────────────────────────────────────
		let user: UserDoc | null = null;
		try {
			user = await UsersModel
				.findOne({ email, archived: false })
				.lean<UserDoc>()
				.exec();
		} catch (err) {
			console.error('[login] DB query failed:', err);
			return fail(503, { error: 'Cannot connect to the database. Please try again.' });
		}

		if (!user) {
			return fail(401, { error: 'Invalid email or password.' });
		}

		if (user.status === 'suspended') {
			return fail(403, { error: 'Your account has been suspended. Contact an administrator.' });
		}

		if (user.status === 'inactive') {
			return fail(403, { error: 'Your account is inactive. Contact an administrator.' });
		}

		// ── Password verification ─────────────────────────────────────────────
		let valid = false;

		if (user.password_hash.startsWith('TEMP_MUST_RESET_')) {
			const local_part = email.split('@')[0];
			valid = password === 'password' || password === local_part;
		} else {
			try {
				const argon2 = await import('argon2');
				valid = await argon2.verify(user.password_hash, password);
			} catch {
				console.error('[login] argon2 unavailable');
				return fail(500, { error: 'Server configuration error. Contact an administrator.' });
			}
		}

		if (!valid) {
			logActivity({
				category:    'user',
				action:      'login',
				description: `Failed login attempt for ${email}`,
				level:       'warning',
				ip_address:  getClientIp(request)
			}).catch(() => {});

			return fail(401, { error: 'Invalid email or password.' });
		}

		// ── Set session cookie ────────────────────────────────────────────────
		cookies.set(
			SESSION_COOKIE,
			encodeSession({
				user_id:   user._id.toString(),
				email:     user.email,
				firstname: user.firstname,
				lastname:  user.lastname,
				role:      user.role,
				exp:       Date.now() + 8 * 60 * 60 * 1000
			}),
			{
				path:     '/',
				maxAge:   8 * 60 * 60,
				httpOnly: true,
				sameSite: 'lax',
				secure:   false
			}
		);

		// Fire-and-forget housekeeping
		UsersModel.findByIdAndUpdate(user._id, { last_login_at: new Date() })
			.exec().catch(() => {});

		logActivity({
			category:     'user',
			action:       'login',
			description:  `${user.firstname} ${user.lastname} logged in`,
			target_id:    user._id.toString(),
			target_label: `${user.firstname} ${user.lastname}`,
			level:        'info',
			ip_address:   getClientIp(request)
		}).catch(() => {});

		redirect(302, '/u/dashboard');
	}
};
