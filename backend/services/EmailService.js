const nodemailer = require('nodemailer');
const invoiceService = require('./InvoiceService');
const { PassThrough } = require('stream');

class EmailService {
    constructor() {
        // Uses Gmail SMTP or any SMTP configured via env vars.
        // For local demo: falls back to Ethereal (test) transport if no creds.
        this.transporter = null;
    }

    async getTransporter() {
        if (this.transporter) return this.transporter;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Ethereal test account for local demo - generates a preview URL
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('[EmailService] Using Ethereal test account:', testAccount.user);
        }

        return this.transporter;
    }

    /**
     * Generate invoice PDF buffer for a booking.
     */
    async generatePDFBuffer(booking) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            const pass = new PassThrough();
            pass.on('data', chunk => chunks.push(chunk));
            pass.on('end', () => resolve(Buffer.concat(chunks)));
            pass.on('error', reject);
            invoiceService.generateInvoice(booking, pass).catch(reject);
        });
    }

    /**
     * Send invoice email to customer.
     * Falls back to saving locally as HTML + PDF if offline (no internet).
     * @param {Object} booking  - populated booking
     * @param {string} toEmail  - recipient email (overrides booking email)
     * @returns {{ success, previewUrl, localPath }}
     */
    async sendInvoiceEmail(booking, toEmail) {
        const invNo    = booking._id.toString().slice(-8).toUpperCase();
        const custName = booking.details?.customerName || booking.userId?.name || 'Guest';
        const listing  = booking.listingId?.title || 'Booking';

        // Generate PDF attachment
        const pdfBuffer = await this.generatePDFBuffer(booking);
        const htmlBody  = this._emailTemplate(custName, invNo, listing, booking.totalPrice, booking.status);

        // Try sending via SMTP (Ethereal or real)
        try {
            const transporter = await this.getTransporter();

            const mailOptions = {
                from: `"BookEase Bookings" <${process.env.SMTP_USER || 'noreply@bookease.lk'}>`,
                to: toEmail,
                subject: `Your Invoice #${invNo} — ${listing}`,
                html: htmlBody,
                attachments: [{
                    filename: `invoice-${invNo}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                }],
            };

            const info = await transporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(info);

            console.log(`[EmailService] Invoice sent via SMTP. Preview: ${previewUrl || 'N/A'}`);

            return {
                success: true,
                messageId: info.messageId,
                previewUrl: previewUrl || null,
            };
        } catch (smtpErr) {
            console.warn(`[EmailService] SMTP failed (offline?): ${smtpErr.message}. Saving locally.`);

            // Offline fallback: save email HTML + PDF to local folder
            const fs = require('fs');
            const path = require('path');
            const outDir = path.join(__dirname, '..', 'email-previews');
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

            const timestamp = Date.now();
            const htmlFile = path.join(outDir, `invoice-${invNo}-${timestamp}.html`);
            const pdfFile  = path.join(outDir, `invoice-${invNo}-${timestamp}.pdf`);

            // Save email HTML with metadata header
            const fullHtml = `<!-- To: ${toEmail} | Subject: Your Invoice #${invNo} -- ${listing} -->\n${htmlBody}`;
            fs.writeFileSync(htmlFile, fullHtml, 'utf-8');
            fs.writeFileSync(pdfFile, pdfBuffer);

            console.log(`[EmailService] Saved locally: ${htmlFile}`);

            return {
                success: true,
                offline: true,
                localHtmlPath: htmlFile,
                localPdfPath: pdfFile,
                message: `Email saved locally (offline mode). Files saved in backend/email-previews/`,
            };
        }
    }

    _emailTemplate(name, invNo, listing, total, status) {
        const statusColor = status === 'confirmed' ? '#16a34a' : status === 'cancelled' ? '#dc2626' : '#d97706';
        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#4f46e5;padding:36px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:-0.5px;">Your Invoice is Ready</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;">Thank you for booking with BookEase</p>
    </div>
    <div style="padding:36px 40px;">
      <p style="color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Your invoice for the booking below has been attached to this email as a PDF.
        Please find the details below.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:6px 0;">Invoice No</td>
            <td style="color:#1e293b;font-size:13px;font-weight:700;text-align:right;">#${invNo}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:6px 0;">Listing</td>
            <td style="color:#1e293b;font-size:13px;font-weight:600;text-align:right;">${listing}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:6px 0;">Status</td>
            <td style="text-align:right;"><span style="color:${statusColor};font-weight:700;font-size:13px;text-transform:capitalize;">${status}</span></td>
          </tr>
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="color:#1e293b;font-size:15px;font-weight:800;padding:12px 0 4px;">Total Amount</td>
            <td style="color:#4f46e5;font-size:18px;font-weight:900;text-align:right;padding:12px 0 4px;line-height:1.4;">
              $${(total || 0).toFixed(2)}<br>
              <span style="font-size:13px;color:#6366f1;font-weight:700;">(LKR ${((total || 0) * 300).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;">
        The full invoice PDF is attached to this email. If you have any questions, please contact us at
        <a href="mailto:support@bookease.lk" style="color:#4f46e5;">support@bookease.lk</a>.
      </p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">BookEase · Multi-Vendor Booking Platform</p>
    </div>
  </div>
</body>
</html>`;
    }
}

module.exports = new EmailService();
