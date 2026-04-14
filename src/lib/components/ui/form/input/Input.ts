import type { Snippet } from 'svelte';
import Date from './Date.svelte';
import Number from './Number.svelte';
import Text from './Text.svelte';

export type Input = {
	style?: string;
	name: string;
	label: string;
	placeholder?: string;
	note?: string;
	required?: boolean;
	width?: 'sm' | 'xs' | 'md' | 'lg' | 'full';
	children?: Snippet;

	//superform
	constraints: object | undefined;
	value: unknown;
	errors: string[] | undefined;
};

const Input = {
	Text,
	Number,
	Date
};

export default Input;
