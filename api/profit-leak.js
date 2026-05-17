const PUBLISHOS = 'https://publishos-eosin.vercel.app';
const ORIGIN = 'https://www.zaypos.co.uk';
const BREVO = 'https://api.brevo.com/v3/smtp/email';

const COVERS_LABEL = { '<50': 'Under 50', '50-150': '50–150', '150-300': '150–300', '300+': '300+' };
const TICKET_LABEL = { '5-10': '£5–10', '10-20': '£10–20', '20-35': '£20–35', '35+': '£35+' };
const VARIANCE_LABEL = { 'never': 'Never', 'monthly': 'Once a month', 'weekly': 'Weekly', 'daily': 'Most days' };

async function sendEmail(apiKey, from, fromName, to, subject, html) {
  return fetch(BREVO, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({ sender: { name: fromName, email: from }, to: [{ email: to }], subject, htmlContent: html })
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);

  const { email, name, business, covers, ticket, variance, weeklyLeak, monthlyLeak, source } = req.body || {};
  if (!email || !covers || !ticket || !variance || typeof weeklyLeak !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ref = 'LEAK-' + Date.now().toString(36).toUpperCase().slice(-6);
  const formattedWeekly = '£' + weeklyLeak.toLocaleString('en-GB');
  const formattedMonthly = '£' + monthlyLeak.toLocaleString('en-GB');
  const formattedYearly = '£' + Math.round(weeklyLeak * 52).toLocaleString('en-GB');
  const firstName = (name || '').split(' ')[0] || '';

  console.log('Profit leak captured:', ref, { email, business, covers, ticket, variance, weeklyLeak });

  try {
    await fetch(PUBLISHOS + '/api/pipeline/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
      body: JSON.stringify({
        name: name || '',
        email,
        company: business || '',
        phone: '',
        jobTitle: 'Owner',
        product: 'zaypos',
        source: source || 'profit-leak-calculator',
        notes: `Profit Leak Calculator result: ${formattedWeekly}/week · covers=${COVERS_LABEL[covers] || covers} · ticket=${TICKET_LABEL[ticket] || ticket} · variance=${VARIANCE_LABEL[variance] || variance}`
      })
    });
  } catch (e) { console.log('PublishOS failed:', e.message); }

  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#FDFAF6;font-family:'DM Sans',Arial,sans-serif;color:#1A1208;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
<tr><td style="background:linear-gradient(135deg,#5B3EF5,#7C62F7);border-radius:12px 12px 0 0;padding:32px;text-align:center;">
<div style="font-size:22px;font-weight:900;color:white;letter-spacing:-0.5px;">Your Profit Leak Report</div>
<div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:6px;">Ref: ${ref}</div>
</td></tr>
<tr><td style="background:#fff;padding:32px;">
<p style="font-size:16px;margin:0 0 14px;">Hi ${firstName || 'there'},</p>
<p style="font-size:14px;line-height:1.65;color:#4A3D2A;margin:0 0 22px;">Based on the answers you gave on zaypos.co.uk, here's an estimate of what your current setup is leaking:</p>
<table width="100%" style="background:#EEE9FE;border-radius:12px;padding:24px;margin:0 0 22px;">
<tr><td align="center">
<div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5B3EF5;margin-bottom:8px;">Estimated weekly leak</div>
<div style="font-family:Fraunces,Georgia,serif;font-size:42px;font-weight:700;color:#5B3EF5;letter-spacing:-1.5px;line-height:1;">${formattedWeekly}</div>
<div style="font-size:13px;color:#4A3D2A;margin-top:10px;">≈ ${formattedMonthly}/month · ${formattedYearly}/year</div>
</td></tr>
</table>
<p style="font-size:13px;color:#8A7A65;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Based on your answers</p>
<table width="100%" style="font-size:13.5px;color:#4A3D2A;margin:0 0 24px;">
<tr><td style="padding:6px 0;border-bottom:1px solid #EDE6D8;">Average covers/day</td><td style="padding:6px 0;border-bottom:1px solid #EDE6D8;text-align:right;font-weight:600;">${COVERS_LABEL[covers] || covers}</td></tr>
<tr><td style="padding:6px 0;border-bottom:1px solid #EDE6D8;">Average ticket</td><td style="padding:6px 0;border-bottom:1px solid #EDE6D8;text-align:right;font-weight:600;">${TICKET_LABEL[ticket] || ticket}</td></tr>
<tr><td style="padding:6px 0;">Cash vs till variance</td><td style="padding:6px 0;text-align:right;font-weight:600;">${VARIANCE_LABEL[variance] || variance}</td></tr>
</table>
<p style="font-size:14px;line-height:1.7;color:#4A3D2A;margin:0 0 24px;">ZayPOS catches most of this — integrated cash drawer, instant card receipts, automatic end-of-day reconciliation, and item-level food cost so you know your margin without guessing.</p>
<table><tr><td style="background:linear-gradient(135deg,#5B3EF5,#7C62F7);border-radius:10px;">
<a href="https://www.zaypos.co.uk/trial.html" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:white;text-decoration:none;">Start your 14-day free trial →</a>
</td></tr></table>
<p style="font-size:12px;color:#8A7A65;margin:14px 0 0;">No credit card needed. We move your menu, staff and stock over for you. Live in 24 hours.</p>
</td></tr>
<tr><td style="background:#F5F0E8;border-top:1px solid #EDE6D8;border-radius:0 0 12px 12px;padding:18px 32px;">
<p style="font-size:11px;color:#8A7A65;margin:0;">ZayPOS · Zayn Productions Ltd · Co. No. 16892199 · 1 Alvin Street, Gloucester, GL1 3EJ</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
    try {
      await sendEmail(brevoKey, 'hello@zaypos.co.uk', 'ZayPOS', email, `Your café is leaking ${formattedWeekly}/week — your ZayPOS report`, html);
    } catch (e) { console.log('Brevo email failed:', e.message); }

    if (process.env.NOTIFY_EMAIL) {
      try {
        await sendEmail(brevoKey, 'hello@zaypos.co.uk', 'ZayPOS', process.env.NOTIFY_EMAIL,
          `[${ref}] Profit Leak Calculator: ${formattedWeekly}/wk — ${email}`,
          `<div style="font-family:Arial;max-width:600px;"><h2 style="color:#5B3EF5;">Profit Leak — ${ref}</h2><table style="font-size:14px;width:100%;"><tr><td><b>Email:</b></td><td>${email}</td></tr><tr><td><b>Name:</b></td><td>${name || '-'}</td></tr><tr><td><b>Business:</b></td><td>${business || '-'}</td></tr><tr><td><b>Weekly leak:</b></td><td>${formattedWeekly}</td></tr><tr><td><b>Inputs:</b></td><td>covers=${COVERS_LABEL[covers]} · ticket=${TICKET_LABEL[ticket]} · variance=${VARIANCE_LABEL[variance]}</td></tr><tr><td><b>Source:</b></td><td>${source || 'profit-leak-calculator'}</td></tr></table></div>`);
      } catch (e) { console.log('Notify failed:', e.message); }
    }
  }

  return res.status(200).json({ ok: true, ref });
}
