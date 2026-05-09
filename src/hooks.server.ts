import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {
	auth_limiter,
	write_limiter,
	api_limiter,
	page_limiter,
	getClientIp,
	rateLimitHeaders,
	tooManyRequests
} from '$lib/server/rate-limit';

import { SESSION_COOKIE, parseSession } from '$lib/server/session';
import db from '$lib/server/db/easyvet_dbconn';

const ROUTE_RULES: Array<{
	match: (pathname: string, method: string) => boolean;
	bucket: typeof auth_limiter;
	label: string;
}> = [
	// 1. Auth — strictest (10 req / 15 min per IP)
	{
		match: (p) => p.startsWith('/login') || p.startsWith('/auth') || p.startsWith('/register'),
		bucket: auth_limiter,
		label: 'auth'
	},
	// 2. JSON API endpoints (120 req / 1 min per IP)
	{
		match: (p) => p.startsWith('/api/'),
		bucket: api_limiter,
		label: 'api'
	},
	// 3. Form actions — POST/PATCH/DELETE to any route (60 req / 1 min per IP)
	{
		match: (p, m) => p.startsWith('/u/') && (m === 'POST' || m === 'PATCH' || m === 'DELETE'),
		bucket: write_limiter,
		label: 'write'
	},
	// 4. Page loads — most generous (300 req / 1 min per IP)
	{
		match: (_p, m) => m === 'GET',
		bucket: page_limiter,
		label: 'page'
	}
];

await db.connect();

export const handle: Handle = async ({ event, resolve }) => {
	const { request, url, cookies } = event;
	const ip = getClientIp(request);
	const method = request.method.toUpperCase();
	const pathname = url.pathname;

	// Skip Vite internals
	if (
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/@') ||
		pathname.endsWith('.map') ||
		pathname === '/favicon.ico' ||
		pathname === '/favicon.png'
	) {
		return resolve(event);
	}

	// ── Session guard — protect all /u/ routes ────────────────────
	if (pathname.startsWith('/u/')) {
		const session_raw = cookies.get(SESSION_COOKIE);
		if (session_raw) {
			const session = parseSession(session_raw);
			if (session) {
				event.locals.user = session;
			} else {
				// Invalid or expired — clear and redirect to login
				cookies.delete(SESSION_COOKIE, { path: '/' });
				redirect(302, '/login?expired=1');
			}
		} else {
			// No session — redirect to login
			// Allow in dev mode (remove this block to enforce auth in production)
			if (process.env.NODE_ENV === 'production') {
				redirect(302, `/login?next=${encodeURIComponent(pathname)}`);
			}
			// In development: pass through without auth check
		}
	}

	// ── Rate limiting ─────────────────────────────────────────────
	const rule = ROUTE_RULES.find((r) => r.match(pathname, method));

	if (rule) {
		const key = `${rule.label}:${ip}`;
		const result = rule.bucket.check(key);

		if (!result.allowed) {
			console.warn(
				`[rate-limit] 429 | ${method} ${pathname} | ip=${ip} | bucket=${rule.label} | retry=${result.retry_after}s`
			);
			return tooManyRequests(result);
		}

		const response = await resolve(event);
		const headers = new Headers(response.headers);
		for (const [k, v] of Object.entries(rateLimitHeaders(result))) {
			headers.set(k, v);
		}
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}

	return resolve(event);
};
