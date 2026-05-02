import { browser } from '$app/environment';

// Read persisted preference or system preference
function getInitialTheme(): 'easyvet-light' | 'easyvet-dark' {
	if (!browser) return 'easyvet-light';
	const stored = localStorage.getItem('ev-theme');
	if (stored === 'easyvet-dark' || stored === 'easyvet-light') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'easyvet-dark'
		: 'easyvet-light';
}

function createThemeStore() {
	let current = $state<'easyvet-light' | 'easyvet-dark'>(getInitialTheme());

	// Apply to DOM immediately
	if (browser) {
		document.documentElement.setAttribute('data-theme', current);
	}

	return {
		get current() {
			return current;
		},
		get isDark() {
			return current === 'easyvet-dark';
		},
		toggle() {
			current = current === 'easyvet-light' ? 'easyvet-dark' : 'easyvet-light';
			if (browser) {
				document.documentElement.setAttribute('data-theme', current);
				localStorage.setItem('ev-theme', current);
			}
		},
		set(theme: 'easyvet-light' | 'easyvet-dark') {
			current = theme;
			if (browser) {
				document.documentElement.setAttribute('data-theme', current);
				localStorage.setItem('ev-theme', current);
			}
		}
	};
}

export const theme = createThemeStore();
