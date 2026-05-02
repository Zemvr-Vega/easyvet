import type { RequestHandler } from '@sveltejs/kit';
import AnimalsModel from '$lib/server/models/animals.model';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const customer_id = url.searchParams.get('customer_id');
	if (!customer_id) return json([]);

	const animals = await AnimalsModel.find({ customer_id, archived: false })
		.select('name species _id')
		.sort({ name: 1 })
		.lean();

	return json(JSON.parse(JSON.stringify(animals)));
};
