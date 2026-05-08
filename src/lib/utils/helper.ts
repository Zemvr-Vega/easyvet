import { goto } from '$app/navigation';
import { page } from '$app/state';
import mongoose from 'mongoose';

export const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
export const weekdays = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

export const capitalize = (str: string | undefined): string => {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const get_current_route = (return_type: 'array' | 'string', page: string) => {
	const route_segments = page.split('/');
	route_segments.shift();
	return return_type === 'array' ? route_segments : route_segments.join('/');
};

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 300) {
	let timer: ReturnType<typeof setTimeout>;

	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
}

export function getNumberOrdinal(n: number): string {
	if (isNaN(n)) {
		return '';
	}

	const s = String(n);
	const lastTwoDigits = n % 100;

	//check for the numbers 11, 12, & 13
	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		return s + 'th';
	}

	//the rest of the numbers go here
	switch (n % 10) {
		case 1:
			//for 1, 21, 31...
			return s + 'st';
		case 2:
			//for 2, 22, 32...
			return s + 'nd';
		case 3:
			//for 3, 23, 33...
			return s + 'rd';
		default:
			//for the rest of the numbers
			return s + 'th';
	}
}

// export function parseName(
// 	user: User.Base | Violator.Base,
// 	useMiddleinitial: boolean = false
// ): string {
// 	let name = '';
// 	if (user && user.firstname && user.lastname) {
// 		let middle = '';
// 		if (user.middlename) {
// 			middle = useMiddleinitial ? user.middlename[0] + '.' : user.middlename;
// 		}

// 		name = user.firstname + ' ' + middle + ' ' + user.lastname;

// 		if ('suffix' in user && user.suffix?.trim() !== '') {
// 			name += ' ' + user.suffix;
// 		}
// 	}

// 	return name;
// }

// export function parseAddress({
// 	address_province,
// 	address_city,
// 	address_barangay,
// 	address_line,
// 	address_house_number
// }: Violator.Base): string {
// 	let address = '';

// 	if (address_province && address_city && address_barangay) {
// 		if (address_house_number) {
// 			address += address_house_number + ' ';
// 		}
// 		if (address_line) {
// 			address += address_line + ', ';
// 		}

// 		address += address_barangay + ', ' + address_city + ', ' + address_province;
// 	}

// 	return address;
// }

export const number = {
	fixed(input: string | number, decimal: number) {
		if (!input || typeof input !== 'string' || typeof input !== 'number')
			throw 'input is not a number or string';
		if (input && typeof input === 'string') input = parseFloat(input);
		return parseFloat(input.toFixed(decimal));
	},
	serialize(number: string | number, length: number = 1) {
		let serialNumber = number.toString();

		const zeroes: number[] = [];

		const lessThan10 = (number: number, limit: number) =>
			`${number < limit ? '0' + number : number}`;

		for (let i = 1; i <= length; i++) zeroes.push(1 * Math.pow(10, i));

		zeroes.forEach((i) => {
			serialNumber = lessThan10(parseInt(serialNumber), i);
		});

		return serialNumber;
	},
	random(min: number, max: number) {
		return min + Math.random() * (max - min);
	},
};

export const date = {
	dateIntersection({ dateFrom, dateTo, dates }: { dateFrom: Date; dateTo: Date; dates: Date[] }) {
		return dates.filter((date) => date > dateFrom && date < dateTo);
	},
	formatDate(options: { date?: Date | string; format?: string }) {
		const _options = options || { date: null, format: null };
		let format = _options.format;
		const date = _options.date;

		if (!format) format = 'MMMM dd, yyyy (wk) hh:mm:ss aa';

		const d = !date ? new Date() : new Date(date);
		if (d.toString() === 'Invalid Date') return 'Invalid Date';

		const year = d.getFullYear().toString();
		const month = (d.getMonth() + 1).toString();
		const monthName = months[d.getMonth()];
		const day = d.getDate().toString();
		const weekday = weekdays[d.getDay()];
		const hours24 = d.getHours().toString();
		const hours = (d.getHours() % 12 || 12).toString();
		const minutes = d.getMinutes().toString();
		const seconds = d.getSeconds().toString();
		const ampm = d.getHours() >= 12 ? 'PM' : 'AM';

		const map: { [key: string]: unknown } = {
			MMMM: monthName, // "January" full month
			MMM: monthName.substring(0, 3), // "Jan" 3 letter month
			MM: number.serialize(month), // "01" serialize month
			M1: month, // "1" month
			yyyy: year, // "2022" full year
			yy: year.substring(2), // "22" 2 digit year
			dd: number.serialize(day), // "04" serialize day
			d: day, // "4" day
			wkf: weekday, // "Thursday"
			wk: weekday.substring(0, 3), // "Thu"
			h4: number.serialize(hours24), // "22" 24 hour format
			hh: number.serialize(hours), // "09" hours
			mm: number.serialize(minutes), // "03" minutes
			ss: number.serialize(seconds), // "01" seconds
			aa: ampm, // "AM" or "PM"
		};

		Object.keys(map).forEach((key: string) => {
			while (format?.includes(key)) format = format.replace(key, map[key] as string);
		});

		return format;
	},
	relativeDate(date: Date, referenceDate: Date = new Date()) {
		const units: Record<string, number> = {
			year: 24 * 60 * 60 * 1000 * 365,
			month: (24 * 60 * 60 * 1000 * 365) / 12,
			day: 24 * 60 * 60 * 1000,
			hour: 60 * 60 * 1000,
			minute: 60 * 1000,
			second: 1000,
		};

		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

		const elapsed = date.getTime() - referenceDate.getTime();

		for (const u in units) {
			if (Math.abs(elapsed / units[u]) < 1) continue;
			return rtf.format(Math.round(elapsed / units[u]), u as Intl.RelativeTimeFormatUnit);
		}
	},
	dateToString(params_date?: Date) {
		const date = params_date ?? new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
		const day = String(date.getDate()).padStart(2, '0');

		const formatted = `${year}-${month}-${day}`;
		return formatted;
	},
};

type PermissionLevel = 'own' | 'all' | 'office' | 'no' | null;

type PermissionActions = {
	[key: string]: PermissionLevel;
};

export const permissions = {
	get: (route: string, permissions: string[] | undefined): PermissionActions => {
		return new Proxy({} as PermissionActions, {
			get: (target, action: string) => {
				if (!permissions) {
					return;
				}

				// Find matching permission for this action and route
				const matching = permissions.find((p) => {
					const parts = p.split(':');
					return parts[0] === action && parts[2] === route;
				});

				// Return the access level (middle part) or null if not found
				return matching ? matching.split(':')[1] : null;
			},
		});
	},
	hasAccess: (route: string, permissions: string[]): boolean => {
		const _p = permissions.filter((val) => val.includes(route));
		return _p.some((val) => !val.includes('no'));
	},
};

export const toObjectId = (value: string | null | undefined): mongoose.Types.ObjectId | null => {
	if (!value || value.trim() === '') return null;
	try {
		return new mongoose.Types.ObjectId(value);
	} catch (error) {
		if (error) return null;
		return null;
	}
};

export const parseNumber = (value: string | null, fallback: number): number => {
	const n = Number(value);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

export function parsePagination(url: URL): { skip: number; limit: number } {
	const limit: number = url.searchParams.get('size') ? Number(url.searchParams.get('size')) : 10;
	let skip: number = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;
	skip = (skip - 1) * limit;

	return { skip, limit };
}

export const parseSearchParams = (
	params: URLSearchParams
): { skip: number; limit: number; search: string; archived: number } => {
	const sizeParam = params.get('size');
	const limit = sizeParam === 'all' ? Number.MAX_SAFE_INTEGER : parseNumber(sizeParam, 10);
	const page = parseNumber(params.get('page'), 1);
	const skip = (page - 1) * limit;

	const search = params.get('search')?.trim() ?? '';
	const archived = params.get('archived') !== null ? Number(params.get('archived')) : 1;

	return { skip, limit, search, archived };
};

export function gotoWithParams(params: { key: string; value: unknown }[]) {
	const url = new URL(page.url); // clone current URL

	// Set or update only this param
	params.forEach((param) => {
		url.searchParams.set(param.key, param.value as string);
	});

	// Navigate to updated URL
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	goto(url.pathname + '?' + url.searchParams.toString());
}