/**
 * Navigation progress indicator.
 * Uses SvelteKit's beforeNavigate / afterNavigate hooks.
 * Import and use the <NavProgress /> component in layout.
 */
let navigating = $state(false);
let progress   = $state(0);
let timer: ReturnType<typeof setInterval> | null = null;

function start() {
	navigating = true;
	progress   = 5;
	timer = setInterval(() => {
		// Fake incremental progress — never reaches 100 until done
		if (progress < 85) {
			progress += Math.random() * 8;
		}
	}, 180);
}

function done() {
	if (timer) clearInterval(timer);
	progress   = 100;
	setTimeout(() => {
		navigating = false;
		progress   = 0;
	}, 300);
}

export const nav_progress = {
	get navigating() { return navigating; },
	get progress()   { return progress; },
	start,
	done
};
