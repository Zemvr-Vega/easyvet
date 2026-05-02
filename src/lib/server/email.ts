/**
 * Email notification service.
 * Uses Node's built-in `net` module to detect if SMTP is configured,
 * and nodemailer (if installed) to send. Falls back to console logging
 * in dev when SMTP is not set up — no crashes, no extra npm installs needed.
 *
 * Required .env variables:
 *   SMTP_HOST     e.g. smtp.gmail.com
 *   SMTP_PORT     e.g. 587
 *   SMTP_USER     e.g. your@email.com
 *   SMTP_PASS     e.g. app-password
 *   SMTP_FROM     e.g. "EasyVet <no-reply@easyvet.com>"
 *
 * Optional:
 *   SMTP_SECURE   true for port 465, false for STARTTLS (default false)
 *   APP_URL       base URL for links in emails, e.g. https://easyvet.local
 */

import { env } from '$env/dynamic/private';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailPayload {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
}

export interface NotificationContext {
	animal_name?: string;
	owner_name?: string;
	doctor_name?: string;
	scheduled_at?: Date | string;
	type?: string;
	notes?: string;
	invoice_number?: string;
	amount?: number;
	item_name?: string;
	quantity?: number;
	reorder_level?: number;
}

// ─── SMTP check ───────────────────────────────────────────────────────────────

function isSmtpConfigured(): boolean {
	return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

// ─── Core sender ─────────────────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; message: string }> {
	if (!isSmtpConfigured()) {
		console.log('[email] SMTP not configured — would have sent:');
		console.log(`  To: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`);
		console.log(`  Subject: ${payload.subject}`);
		return { ok: true, message: 'SMTP not configured — email skipped (dev mode)' };
	}

	try {
		// Dynamic import — only works if nodemailer is installed
		// Run: npm install nodemailer @types/nodemailer
		const nodemailer = await import('nodemailer').catch(() => null);

		if (!nodemailer) {
			console.warn('[email] nodemailer not installed. Run: npm install nodemailer');
			return { ok: false, message: 'nodemailer not installed' };
		}

		const transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: parseInt(env.SMTP_PORT ?? '587'),
			secure: env.SMTP_SECURE === 'true',
			auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
		});

		await transporter.sendMail({
			from: env.SMTP_FROM ?? `EasyVet <${env.SMTP_USER}>`,
			to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
			subject: payload.subject,
			html: payload.html,
			text: payload.text ?? payload.html.replace(/<[^>]+>/g, '')
		});

		return { ok: true, message: 'Email sent' };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error('[email] Send failed:', msg);
		return { ok: false, message: msg };
	}
}

// ─── HTML email template ──────────────────────────────────────────────────────

function emailWrapper(title: string, body: string): string {
	return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:system-ui,sans-serif;background:#f4f4f5;margin:0;padding:24px}
  .card{background:#fff;border-radius:10px;padding:32px;max-width:520px;margin:0 auto;border:1px solid #e5e7eb}
  .logo{font-weight:800;font-size:20px;color:#4f46e5;margin-bottom:24px}
  h2{margin:0 0 8px;font-size:18px;color:#111}
  p{color:#555;font-size:14px;line-height:1.6;margin:8px 0}
  .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600}
  .info{background:#eff6ff;color:#1d4ed8}
  .success{background:#f0fdf4;color:#15803d}
  .warning{background:#fffbeb;color:#b45309}
  .field{margin:12px 0;padding:10px 14px;background:#f8fafc;border-radius:6px;border-left:3px solid #4f46e5}
  .field-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#888}
  .field-value{font-size:14px;color:#111;margin-top:2px;font-weight:500}
  .footer{text-align:center;font-size:11px;color:#aaa;margin-top:24px}
</style></head><body>
<div class="card">
  <div class="logo">🐾 EasyVet</div>
  <h2>${title}</h2>
  ${body}
  <div class="footer">EasyVet Veterinary Management System · Automated notification</div>
</div></body></html>`;
}

// ─── Notification templates ───────────────────────────────────────────────────

export const notify = {

	async appointmentScheduled(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `Appointment Scheduled — ${ctx.animal_name ?? 'Patient'}`,
			html: emailWrapper(
				'Appointment Scheduled',
				`<p>An appointment has been scheduled for <strong>${ctx.animal_name}</strong>.</p>
				 <div class="field"><div class="field-label">Owner</div><div class="field-value">${ctx.owner_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Veterinarian</div><div class="field-value">Dr. ${ctx.doctor_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Type</div><div class="field-value" style="text-transform:capitalize">${ctx.type ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Date & Time</div><div class="field-value">${ctx.scheduled_at ? new Date(ctx.scheduled_at).toLocaleString() : '—'}</div></div>
				 ${ctx.notes ? `<div class="field"><div class="field-label">Notes</div><div class="field-value">${ctx.notes}</div></div>` : ''}`
			)
		});
	},

	async consultationCreated(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `New Consultation — ${ctx.animal_name ?? 'Patient'}`,
			html: emailWrapper(
				'New Consultation Record',
				`<p>A consultation has been recorded for <strong>${ctx.animal_name}</strong>.</p>
				 <div class="field"><div class="field-label">Owner</div><div class="field-value">${ctx.owner_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Veterinarian</div><div class="field-value">Dr. ${ctx.doctor_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Type</div><div class="field-value" style="text-transform:capitalize">${ctx.type ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Date</div><div class="field-value">${ctx.scheduled_at ? new Date(ctx.scheduled_at).toLocaleDateString() : '—'}</div></div>`
			)
		});
	},

	async vaccinationAdministered(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `Vaccination Administered — ${ctx.animal_name ?? 'Patient'}`,
			html: emailWrapper(
				'Vaccination Administered',
				`<p>A vaccination has been administered to <strong>${ctx.animal_name}</strong>.</p>
				 <div class="field"><div class="field-label">Owner</div><div class="field-value">${ctx.owner_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Vaccine</div><div class="field-value">${ctx.type ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Date</div><div class="field-value">${ctx.scheduled_at ? new Date(ctx.scheduled_at).toLocaleDateString() : '—'}</div></div>`
			)
		});
	},

	async surgeryScheduled(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `Surgery Scheduled — ${ctx.animal_name ?? 'Patient'}`,
			html: emailWrapper(
				'Surgery Scheduled',
				`<p>A surgery has been scheduled for <strong>${ctx.animal_name}</strong>.</p>
				 <div class="field"><div class="field-label">Owner</div><div class="field-value">${ctx.owner_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Surgeon</div><div class="field-value">Dr. ${ctx.doctor_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Procedure</div><div class="field-value" style="text-transform:capitalize">${ctx.type ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Scheduled</div><div class="field-value">${ctx.scheduled_at ? new Date(ctx.scheduled_at).toLocaleString() : '—'}</div></div>`
			)
		});
	},

	async hospitalizationAdmitted(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `Patient Admitted — ${ctx.animal_name ?? 'Patient'}`,
			html: emailWrapper(
				'Patient Admitted',
				`<p><strong>${ctx.animal_name}</strong> has been admitted to the hospital.</p>
				 <div class="field"><div class="field-label">Owner</div><div class="field-value">${ctx.owner_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Reason</div><div class="field-value" style="text-transform:capitalize">${ctx.type ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Attending Vet</div><div class="field-value">Dr. ${ctx.doctor_name ?? '—'}</div></div>`
			)
		});
	},

	async labResultReady(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `Lab Results Ready — ${ctx.animal_name ?? 'Patient'}`,
			html: emailWrapper(
				'Laboratory Results Ready',
				`<p>Lab results are now available for <strong>${ctx.animal_name}</strong>.</p>
				 <div class="field"><div class="field-label">Owner</div><div class="field-value">${ctx.owner_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Test</div><div class="field-value">${ctx.type ?? '—'}</div></div>
				 ${ctx.notes ? `<div class="field"><div class="field-label">Summary</div><div class="field-value">${ctx.notes}</div></div>` : ''}`
			)
		});
	},

	async invoiceSent(to: string | string[], ctx: NotificationContext) {
		const amount = ctx.amount
			? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(ctx.amount)
			: '—';
		return sendEmail({
			to,
			subject: `Invoice ${ctx.invoice_number ?? ''} — EasyVet`,
			html: emailWrapper(
				`Invoice ${ctx.invoice_number ?? ''}`,
				`<p>An invoice has been generated for <strong>${ctx.owner_name ?? 'customer'}</strong>.</p>
				 <div class="field"><div class="field-label">Patient</div><div class="field-value">${ctx.animal_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Total Amount</div><div class="field-value">${amount}</div></div>
				 ${ctx.notes ? `<div class="field"><div class="field-label">Notes</div><div class="field-value">${ctx.notes}</div></div>` : ''}
				 <p style="margin-top:16px">Please contact the clinic if you have questions about this invoice.</p>`
			)
		});
	},

	async lowStockAlert(to: string | string[], ctx: NotificationContext) {
		return sendEmail({
			to,
			subject: `Low Stock Alert — ${ctx.item_name ?? 'Item'}`,
			html: emailWrapper(
				'Low Stock Alert',
				`<p>An inventory item has fallen below the reorder level.</p>
				 <div class="field"><div class="field-label">Item</div><div class="field-value">${ctx.item_name ?? '—'}</div></div>
				 <div class="field"><div class="field-label">Current Quantity</div><div class="field-value" style="color:#dc2626;font-weight:700">${ctx.quantity ?? 0}</div></div>
				 <div class="field"><div class="field-label">Reorder Level</div><div class="field-value">${ctx.reorder_level ?? '—'}</div></div>
				 <p>Please restock this item as soon as possible.</p>`
			)
		});
	}
};
