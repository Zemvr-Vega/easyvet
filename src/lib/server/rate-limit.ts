/**
 * Sliding-window rate limiter — pure in-process, zero external deps.
 *
 * One Map<key, timestamps[]> per bucket.
 * A background interval prunes stale entries so memory stays bounded.
 *
 * Usage:
 *   const result = limiter.check(key);
 *   if (!result.allowed) return rateLimitResponse(result);
 */

export interface RateLimitResult {
	allowed: boolean;
	limit: number;
	remaining: number;
	reset_at: number; // Unix seconds
	retry_after: number; // seconds until next allowed request
}

export interface RateLimitConfig {
	/** Max requests allowed within the window */
	max: number;
	/** Window duration in milliseconds */
	window_ms: number;
}

class SlidingWindowLimiter {
	private store = new Map<string, number[]>();
	private config: RateLimitConfig;

	constructor(config: RateLimitConfig) {
		this.config = config;

		// Prune expired entries every minute to prevent unbounded memory growth
		setInterval(() => this.prune(), 60_000).unref?.();
	}

	check(key: string): RateLimitResult {
		const now = Date.now();
		const window_start = now - this.config.window_ms;

		// Get existing timestamps and drop anything outside the window
		const timestamps = (this.store.get(key) ?? []).filter((t) => t > window_start);

		const count = timestamps.length;
		const allowed = count < this.config.max;

		if (allowed) {
			timestamps.push(now);
		}

		this.store.set(key, timestamps);

		// When will the oldest request fall out of the window?
		const oldest = timestamps[0] ?? now;
		const reset_at = Math.ceil((oldest + this.config.window_ms) / 1000);
		const retry_after = allowed ? 0 : Math.ceil((oldest + this.config.window_ms - now) / 1000);

		return {
			allowed,
			limit: this.config.max,
			remaining: Math.max(0, this.config.max - timestamps.length),
			reset_at,
			retry_after
		};
	}

	private prune() {
		const cutoff = Date.now() - this.config.window_ms;
		for (const [key, timestamps] of this.store) {
			const fresh = timestamps.filter((t) => t > cutoff);
			if (fresh.length === 0) {
				this.store.delete(key);
			} else {
				this.store.set(key, fresh);
			}
		}
	}
}

// ─── Named limiters ─────────────────────────────────────────────────
// Tune these per-bucket rather than one global limit.

/** Strict: login/auth endpoints — 10 req / 15 min */
export const auth_limiter = new SlidingWindowLimiter({ max: 10, window_ms: 15 * 60_000 });

/** Moderate: write actions (POST/PATCH/DELETE form actions) — 60 req / 1 min */
export const write_limiter = new SlidingWindowLimiter({ max: 60, window_ms: 60_000 });

/** Relaxed: read API endpoints (GET /api/*) — 120 req / 1 min */
export const api_limiter = new SlidingWindowLimiter({ max: 120, window_ms: 60_000 });

/** Very relaxed: page loads — 300 req / 1 min */
export const page_limiter = new SlidingWindowLimiter({ max: 300, window_ms: 60_000 });

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Extract client IP from a SvelteKit RequestEvent.
 * Respects X-Forwarded-For (set by proxies/Vite dev server).
 */
export function getClientIp(request: Request): string {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
		request.headers.get('x-real-ip') ??
		'unknown'
	);
}

/**
 * Build the standard rate-limit response headers (RFC 6585 / draft-ietf-httpapi-ratelimit-headers).
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
	return {
		'X-RateLimit-Limit': String(result.limit),
		'X-RateLimit-Remaining': String(result.remaining),
		'X-RateLimit-Reset': String(result.reset_at),
		...(result.retry_after > 0 ? { 'Retry-After': String(result.retry_after) } : {})
	};
}

/**
 * Build a 429 Too Many Requests Response with a JSON body.
 */
export function tooManyRequests(result: RateLimitResult): Response {
	return new Response(
		JSON.stringify({
			error: 'Too Many Requests',
			message: `Rate limit exceeded. Try again in ${result.retry_after} second${result.retry_after === 1 ? '' : 's'}.`,
			retry_after: result.retry_after,
			reset_at: result.reset_at
		}),
		{
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				...rateLimitHeaders(result)
			}
		}
	);
}
