// Shared constants — safe to import in both server and browser code

export const SERVICE_CATALOG = [
	{ id: 'consult-general', name: 'General Consultation', price: 350 },
	{ id: 'consult-specialist', name: 'Specialist Consultation', price: 750 },
	{ id: 'vaccination-core', name: 'Core Vaccination', price: 500 },
	{ id: 'vaccination-rabies', name: 'Rabies Vaccination', price: 350 },
	{ id: 'surgery-minor', name: 'Minor Surgery', price: 2500 },
	{ id: 'surgery-major', name: 'Major Surgery', price: 8000 },
	{ id: 'dental-cleaning', name: 'Dental Cleaning', price: 1500 },
	{ id: 'dental-extraction', name: 'Tooth Extraction', price: 800 },
	{ id: 'grooming-basic', name: 'Basic Grooming', price: 400 },
	{ id: 'grooming-full', name: 'Full Grooming Package', price: 900 },
	{ id: 'xray', name: 'X-Ray', price: 600 },
	{ id: 'bloodwork', name: 'Blood Work Panel', price: 1200 },
	{ id: 'urinalysis', name: 'Urinalysis', price: 350 },
	{ id: 'ecg', name: 'ECG / Electrocardiogram', price: 800 },
	{ id: 'ultrasound', name: 'Ultrasound', price: 1500 },
	{ id: 'hospitalization', name: 'Hospitalization (per day)', price: 1200 },
	{ id: 'deworming', name: 'Deworming', price: 250 },
	{ id: 'flea-treatment', name: 'Flea & Tick Treatment', price: 400 }
] as const;

export type ServiceItem = (typeof SERVICE_CATALOG)[number];

export const PAYMENT_METHODS = ['cash', 'gcash', 'card', 'bank_transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const SPECIES_EMOJI: Record<string, string> = {
	dog: '🐕',
	cat: '🐈',
	bird: '🦜',
	rabbit: '🐇',
	reptile: '🦎',
	fish: '🐟',
	other: '🐾'
};

export function formatPHP(amount: number): string {
	return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount ?? 0);
}
