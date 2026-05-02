import { parseSearchParams } from "$lib/utils/helper";
import type { PipelineStage } from "mongoose";
import aggregate from "./aggregate.queries";
import type Customer from "$lib/validation/customers.zod";
import CustomersModel from "../models/customers.model";

const CustomerQueries = {
	get: async (params: URLSearchParams) => {
		const { skip, limit, search, archived } = parseSearchParams(params);

		const matchFilter: Record<string, unknown> = {
			combinedText: { $regex: search, $options: 'i' },
		};

		if (archived === -1) {
			matchFilter.archived = true;
		} else if (archived === 1) {
			matchFilter.archived = { $in: [false, null] };
		}

		const pipeline: PipelineStage[] = [
			{
				$addFields: {
					combinedText: {
						$concat: [
							{ $ifNull: [{ $toString: '$public_id' }, ''] },
							{ $ifNull: [{ $toString: '$firstname' }, ''] },
							{ $ifNull: [{ $toString: '$lastname' }, ''] }
						],
					},
				},
			},
			{
				$match: matchFilter,
			},
			{ $sort: { _id: -1 } },
			{
				$unset: 'combinedText',
			},
			{
				$project: { _id: 0 },
			},
			{
				$facet: {
					count: [{ $count: 'total' }],
					data: [{ $skip: skip }, { $limit: limit }],
				},
			},
			{
				$project: {
					count: { $first: '$count.total' },
					data: 1,
				},
			},
		];

		const query = await aggregate<Customer.Public>(CustomersModel, pipeline);

		return query;
	},
	create: () => { }
}

export default CustomerQueries;
