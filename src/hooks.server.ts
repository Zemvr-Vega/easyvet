import { db } from "$lib/server/db/easyvet_dbconn";
import type { Handle } from "@sveltejs/kit";
import process from "process";

try {
	await db.connect();
} catch (error) {
	console.log("Failed to connect to database: ", error);
	process.exit(1);
}

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
}