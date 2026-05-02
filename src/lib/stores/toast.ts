/**
 * svelte-sonner toast helper.
 *
 * Import anywhere in Svelte files:
 *   import { toast } from '$lib/stores/toast';
 *
 *   toast.success('Saved!');
 *   toast.error('Failed', 'Check required fields');
 *   toast.info('Note');
 *   toast.warning('Low stock');
 *   toast.loading('Processing...');
 *   toast.dismiss();
 *   toast.promise(fetch('/api/save'), {
 *     loading: 'Saving…',
 *     success: 'Saved!',
 *     error: 'Failed to save'
 *   });
 *
 * The <Toaster /> component must be mounted once in the root +layout.svelte.
 * It is already mounted — do not add another.
 */
import { toast as _toast } from 'svelte-sonner';

export const toast = {
	/** Green success notification */
	success(message: string, description?: string) {
		return _toast.success(message, { description });
	},

	/** Red error notification */
	error(message: string, description?: string) {
		return _toast.error(message, { description });
	},

	/** Blue info notification */
	info(message: string, description?: string) {
		return _toast.info(message, { description });
	},

	/** Yellow warning notification */
	warning(message: string, description?: string) {
		return _toast.warning(message, { description });
	},

	/** Loading spinner notification — returns toast id */
	loading(message: string) {
		return _toast.loading(message);
	},

	/** Dismiss a specific toast by id, or all toasts if no id given */
	dismiss(id?: string | number) {
		return _toast.dismiss(id);
	},

	/** Promise toast — shows loading → success/error automatically */
	promise<T>(
		promise: Promise<T>,
		opts: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((err: unknown) => string);
		}
	) {
		return _toast.promise(promise, opts);
	}
};

// Also export the raw sonner instance for advanced usage
export { _toast as sonner };
