import type { Model, PipelineStage } from 'mongoose';

export type AggregateReturn<T> = {
	total: number;
	data: T[];
};

const aggregate = async <TResult>(
	model: Model<unknown>,
	pipeline: PipelineStage[]
): Promise<AggregateReturn<TResult>> => {
	try {
		const res = await model.aggregate(pipeline).exec();
		const result = res[0] ?? { count: 0, data: [] };

		return {
			total: result.count ?? 0,
			data: result.data,
		};
	} catch (error) {
		throw new Error(`Aggregation failed: ${error}`);
	}
};

export default aggregate;
