/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// See https://svelte.dev/docs/kit/types#app.d.ts

declare namespace NodeJS {
	interface Global {
		mongoose: {
			conn: any;
			promise: Promise<any>;
		} | null;
	}
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: Record<string, unknown>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'error' | 'success' | 'action';
				text: string;
				data?: unknown;
			};
		}
		interface PageData {
			flash?: { type?: 'success' | 'error'; message: string };
		}
	}
}

export {};
