import { MONGO_URL, NODE_ENV } from '$env/static/private';
import mongoose, { type ConnectOptions } from 'mongoose';

export async function connectDB() {
	console.log('~~~ connection to easyvet database ~~~');
	const options = {
		dbName: 'easyvet',
		autoIndex: NODE_ENV !== 'production',
		bufferCommands: false,
		maxPoolSize: 100
	};

	return mongoose.createConnection(MONGO_URL, options as ConnectOptions);
}

export default await connectDB();
