// Server-only billing utilities (DB access, invoice numbering, totals)
import InvoicesModel from '$lib/server/models/invoices.model';

// Re-export from shared constants so server code can still use these
export { SERVICE_CATALOG, formatPHP } from '$lib/constants';

export async function generateInvoiceNumber(): Promise<string> {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const prefix = `INV-${year}${month}`;

	const latest = await InvoicesModel.findOne({ invoice_number: new RegExp(`^${prefix}`) })
		.sort({ invoice_number: -1 })
		.lean();

	let seq = 1;
	if (latest && latest.invoice_number) {
		const parts = (latest.invoice_number as string).split('-');
		const lastSeq = parseInt(parts[parts.length - 1]);
		if (!isNaN(lastSeq)) seq = lastSeq + 1;
	}

	return `${prefix}-${String(seq).padStart(4, '0')}`;
}

export function calculateTotals(
	items: { quantity: number; unit_price: number }[],
	discount_amount = 0,
	tax_percent = 0
) {
	const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
	const taxable = Math.max(0, subtotal - discount_amount);
	const tax_amount = (taxable * tax_percent) / 100;
	const total = taxable + tax_amount;
	return { subtotal, discount_amount, tax_amount, total };
}

