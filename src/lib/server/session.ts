/**
 * Session helpers shared between hooks.server.ts and login/+page.server.ts.
 * Keeping the cookie name in one place prevents typo-drift.
 */

export const SESSION_COOKIE = 'ev_session';

export interface SessionData {
	user_id:   string;
	email:     string;
	firstname: string;
	lastname:  string;
	role:      string;
	exp:       number; // Unix ms timestamp
}

/** Decode and validate a raw session cookie value. Returns null if invalid or expired. */
export function parseSession(raw: string): SessionData | null {
	try {
		const data = JSON.parse(
			Buffer.from(raw, 'base64').toString('utf-8')
		) as SessionData;
		if (!data.exp || data.exp <= Date.now()) return null;
		return data;
	} catch {
		return null;
	}
}

/** Encode session data into the base64 string stored in the cookie. */
export function encodeSession(data: SessionData): string {
	return Buffer.from(JSON.stringify(data), 'utf-8').toString('base64');
}
