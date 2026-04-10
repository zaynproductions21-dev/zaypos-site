// api/enquiry.js — ZayPOS contact form handler
// Vercel serverless function
// Environment variables needed (set in Vercel → Settings → Environment Variables):
//   NOTIFY_EMAIL   → who gets the alert email (e.g. hello@zaypos.co.uk)
//   RESEND_API_KEY → from resend.com (free tier, 3000 emails/month)
//   WEBHOOK_URL    → optional — Zapier / Make / HubSpot webhook URL

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    fname, lname, email, phone,
    biz, biztype, subject, message, consent
  } = req.body;

  // ── Validate required fields ──────────────────────────────────────────
  if (!fname || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!consent) {
    return res.status(400).json({ error: 'Consent required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // ── Generate reference number ─────────────────────────────────────────
  const ref = 'ZAY-' + Date.now().toString(36).toUpperCase();
  const timestamp = new Date().toISOString();

  // ── Log to Vercel console (always works, no config needed) ────────────
  console.log('New ZayPOS enquiry:', {
    ref, timestamp,
    name: `${fname} ${lname}`,
    email, phone,
    business: biz,
    businessType: biztype,
    subject, message
  });

  // ── Send email via Resend (if RESEND_API_KEY is set) ──────────────────
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ZayPOS Enquiries <noreply@zaypos.co.uk>',
          to: [process.env.NOTIFY_EMAIL],
          subject: `New enquiry [${ref}]: ${subject}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#5B3EF5;padding:24px 32px;border-radius:12px 12px 0 0;">
                <h1 style="color:#fff;margin:0;font-size:22px;">New ZayPOS Enquiry</h1>
                <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">Ref: ${ref}</p>
              </div>
              <div style="background:#FDFAF6;padding:32px;border:1px solid #E5DDD0;border-top:none;border-radius:0 0 12px 12px;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:8px 0;color:#8A7A65;width:140px;">Name</td><td style="padding:8px 0;color:#1A1208;font-weight:500;">${fname} ${lname || ''}</td></tr>
                  <tr><td style="padding:8px 0;color:#8A7A65;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#5B3EF5;">${email}</a></td></tr>
                  ${phone ? `<tr><td style="padding:8px 0;color:#8A7A65;">Phone</td><td style="padding:8px 0;color:#1A1208;">${phone}</td></tr>` : ''}
                  ${biz ? `<tr><td style="padding:8px 0;color:#8A7A65;">Business</td><td style="padding:8px 0;color:#1A1208;">${biz}</td></tr>` : ''}
                  ${biztype ? `<tr><td style="padding:8px 0;color:#8A7A65;">Type</td><td style="padding:8px 0;color:#1A1208;">${biztype}</td></tr>` : ''}
                  <tr><td style="padding:8px 0;color:#8A7A65;">Topic</td><td style="padding:8px 0;color:#1A1208;">${subject}</td></tr>
                  <tr><td style="padding:8px 0;color:#8A7A65;vertical-align:top;">Message</td><td style="padding:8px 0;color:#1A1208;">${message.replace(/\n/g,'<br>')}</td></tr>
                  <tr><td style="padding:8px 0;color:#8A7A65;">Received</td><td style="padding:8px 0;color:#8A7A65;font-size:12px;">${timestamp}</td></tr>
                </table>
                <div style="margin-top:24px;padding-top:20px;border-top:1px solid #E5DDD0;">
                  <a href="mailto:${email}?subject=Re: Your ZayPOS enquiry [${ref}]" style="display:inline-block;background:#5B3EF5;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Reply to ${fname} →</a>
                </div>
              </div>
              <p style="font-size:11px;color:#B0A090;text-align:center;margin-top:16px;">ZayPOS · Zayn Productions Ltd · Company No. 16892199</p>
            </div>
          `
        })
      });
      console.log('Email sent via Resend to', process.env.NOTIFY_EMAIL);
    } catch (err) {
      console.error('Resend email error:', err.message);
      // Don't fail the request — just log it
    }
  }

  // ── Send to CRM webhook (if WEBHOOK_URL is set) ───────────────────────
  if (process.env.WEBHOOK_URL) {
    try {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref, timestamp,
          first_name: fname,
          last_name: lname || '',
          email, phone: phone || '',
          business_name: biz || '',
          business_type: biztype || '',
          subject, message,
          source: 'zaypos.co.uk contact form'
        })
      });
      console.log('Lead sent to CRM webhook');
    } catch (err) {
      console.error('CRM webhook error:', err.message);
    }
  }

  // ── Success — return ref so thank-you page can display it ─────────────
  return res.status(200).json({ ok: true, ref });
}
