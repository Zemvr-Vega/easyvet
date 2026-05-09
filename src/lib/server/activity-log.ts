import ActivityLogModel, { type activity_categories, type activity_actions } from './models/activity-log.model';

export interface LogOptions {
	category: (typeof activity_categories)[number];
	action: (typeof activity_actions)[number];
	description: string;
	target_id?: string;
	target_label?: string;
	performed_by?: string;
	performed_by_id?: string;
	level?: 'info' | 'warning' | 'error' | 'success';
	meta?: Record<string, unknown>;
	ip_address?: string;
}

/**
 * Log any system activity. Fire-and-forget — never throws.
 * Call this after every create/update/delete action in +page.server.ts.
 */
export async function logActivity(opts: LogOptions): Promise<void> {
	try {
		await ActivityLogModel.create({
			category:      opts.category,
			action:        opts.action,
			description:   opts.description,
			target_id:     opts.target_id     ?? '',
			target_label:  opts.target_label  ?? '',
			performed_by:  opts.performed_by  ?? 'System',
			performed_by_id: opts.performed_by_id,
			level:         opts.level         ?? 'info',
			meta:          opts.meta,
			ip_address:    opts.ip_address    ?? ''
		});
	} catch (err) {
		// Never crash the request over a logging failure
		console.error('[activity-log] Failed to log:', err);
	}
}
