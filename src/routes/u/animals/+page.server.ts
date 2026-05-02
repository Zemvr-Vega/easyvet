import type { PageServerLoad } from './$types';
import AnimalsModel from '$lib/server/models/animals.model';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const size = Math.min(50, Math.max(1, Number(url.searchParams.get('size')) || 10));
	const search = url.searchParams.get('q')?.trim() ?? '';
	const species_filter = url.searchParams.get('species') ?? '';

	const query: Record<string, unknown> = { archived: false };

	if (search) {
		const regex = { $regex: search, $options: 'i' };
		query.$or = [{ name: regex }, { breed: regex }, { microchip_id: regex }];
	}
	if (species_filter) query.species = species_filter;

	const [animals_raw, total] = await Promise.all([
		AnimalsModel.find(query)
			.sort({ createdAt: -1 })
			.skip((page - 1) * size)
			.limit(size)
			.populate('customer_id', 'firstname lastname contact_number')
			.lean(),
		AnimalsModel.countDocuments(query)
	]);

	const animals = JSON.parse(JSON.stringify(animals_raw));

	return { animals, total, page, size, search, species_filter };
};
