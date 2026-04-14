import { goto } from '$app/navigation';
import { page } from '$app/state';

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
	'December'
];
export const weekdays = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

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
	}
};

export const date = {
	dateIntersection({ dateFrom, dateTo, dates }: { dateFrom: Date; dateTo: Date; dates: Date[] }) {
		return dates.filter((date) => date > dateFrom && date < dateTo);
	},
	formatDate(options: { date?: Date | string; format?: string }) {
		let { date, format } = options || { date: null, format: null };

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

		const map: { [key: string]: any } = {
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
			aa: ampm // "AM" or "PM"
		};

		Object.keys(map).forEach((key: string) => {
			while (format?.includes(key)) format = format.replace(key, map[key]);
		});

		return format;
	},
	relativeDate(date: Date, referenceDate: Date = new Date()) {
		const units: any = {
			year: 24 * 60 * 60 * 1000 * 365,
			month: (24 * 60 * 60 * 1000 * 365) / 12,
			day: 24 * 60 * 60 * 1000,
			hour: 60 * 60 * 1000,
			minute: 60 * 1000,
			second: 1000
		};

		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

		const elapsed = date.getTime() - referenceDate.getTime();

		for (const u in units) {
			if (Math.abs(elapsed / units[u]) < 1) continue;
			return rtf.format(Math.round(elapsed / units[u]), u as any);
		}
	},
	dateToString(params_date?: Date) {
		let date = params_date ?? new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
		const day = String(date.getDate()).padStart(2, '0');

		const formatted = `${year}-${month}-${day}`;
		return formatted;
	}
};

export function updateQueryParam(params: { key: string; value: any }[]) {
	const url = new URL(page.url); // clone current URL

	// Set or update only this param
	params.forEach((param) => {
		url.searchParams.set(param.key, param.value);
	});

	// Navigate to updated URL
	goto(url.pathname + '?' + url.searchParams.toString());
}
