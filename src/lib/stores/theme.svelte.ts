import { browser } from '$app/environment';

export type Theme = 'nord' | 'dark';

function getInitialTheme(): Theme {
	if (!browser) return 'nord';
	const stored = localStorage.getItem('ev-theme');
	if (stored === 'dark' || stored === 'nord') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'nord';
}

function createThemeStore() {
	let current = $state<Theme>(getInitialTheme());

	if (browser) {
		document.documentElement.setAttribute('data-theme', current);
	}

	return {
		get current() { return current; },
		get isDark() { return current === 'dark'; },
		toggle() {
			current = current === 'nord' ? 'dark' : 'nord';
			if (browser) {
				document.documentElement.setAttribute('data-theme', current);
				localStorage.setItem('ev-theme', current);
			}
		}
	};
}

export const theme = createThemeStore();
