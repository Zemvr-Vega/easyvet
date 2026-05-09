import { MONGO_URL, NODE_ENV } from '$env/static/private';
import type { ConnectOptions } from 'mongoose';
import mongoose from 'mongoose';

export const options: ConnectOptions = {
	dbName: 'easyvet',
	autoIndex: NODE_ENV !== 'production',
	bufferCommands: false,
	maxPoolSize: 100
} as ConnectOptions;

export const db = {
	connect: async () => {
		if (mongoose.connection.readyState >= 1) {
			console.log('Connection already established');
			return mongoose.connection;
		}

		await mongoose.connect(MONGO_URL, options);
		console.log(`MongoDB connected: ${mongoose.connection.host}`);

		return mongoose.connection;
	}
};

export default db;
