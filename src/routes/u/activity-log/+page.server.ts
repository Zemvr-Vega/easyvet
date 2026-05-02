import type { PageServerLoad } from './$types';
import ActivityLogModel from '$lib/server/models/activity-log.model';

export const load: PageServerLoad = async ({ url }) => {
	const page     = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size     = Math.min(100, Number(url.searchParams.get('size')) || 25);
	const category = url.searchParams.get('category') ?? '';
	const level    = url.searchParams.get('level') ?? '';
	const search   = url.searchParams.get('q')?.trim() ?? '';

	const query: Record<string, unknown> = {};
	if (category) query.category = category;
	if (level)    query.level    = level;
	if (search) {
		const re = { $regex: search, $options: 'i' };
		query.$or = [{ description: re }, { target_label: re }, { performed_by: re }];
	}

	const [logs_raw, total] = await Promise.all([
		ActivityLogModel.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.lean(),
		ActivityLogModel.countDocuments(query)
	]);

	return {
		logs: JSON.parse(JSON.stringify(logs_raw)),
		total, page, size, category, level, search
	};
};
