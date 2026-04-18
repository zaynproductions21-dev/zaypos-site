var BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM = { email: 'hello@zaypos.co.uk', name: 'ZayPOS' };
const PRODUCT = 'ZayPOS';
const PRICING_URL = 'https://www.zaypos.co.uk/#pricing';
const DOCS_URL = 'https://www.zaypos.co.uk/getting-started';
const PORTAL_URL = 'https://app.zaypos.co.uk';
const COLOR = '#059669';

function trialEmails(name) {
  var f = name.split(' ')[0] || 'there';
  return [
    { delayDays: 3, subject: f + ', how are you getting on with ' + PRODUCT + '?',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px">Hey ' + f + ' 👋</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">You\'ve been using ' + PRODUCT + ' for a few days now. Here are some tips to get started:</p><ul style="font-size:14px;line-height:1.8;padding-left:20px;margin-bottom:20px"><li><strong>Add your menu items</strong> — import from a spreadsheet or add manually</li><li><strong>Set up a test order</strong> — try the full flow from order to payment</li><li><strong>Add a staff member</strong> — give them a PIN and test the login</li></ul><p style="font-size:14px;margin-bottom:24px">Need help? Our <a href="' + DOCS_URL + '" style="color:' + COLOR + ';font-weight:600">getting started guide</a> walks you through everything.</p><a href="' + PORTAL_URL + '" style="display:inline-block;background:' + COLOR + ';color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Open ' + PRODUCT + ' →</a><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' },
    { delayDays: 7, subject: 'Your ' + PRODUCT + ' trial ends in 7 days',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px">One week left, ' + f + '</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">Your free trial of ' + PRODUCT + ' ends in 7 days. Here\'s what you\'ll keep when you upgrade:</p><ul style="font-size:14px;line-height:1.8;padding-left:20px;margin-bottom:20px"><li>Full POS with orders, payments, and receipts</li><li>Unlimited products and categories</li><li>Staff management with PIN login</li><li>Daily sales reports and analytics</li></ul><p style="font-size:14px;margin-bottom:24px">Plans start from <strong>£10/user/month</strong>. Cancel anytime.</p><a href="' + PRICING_URL + '" style="display:inline-block;background:' + COLOR + ';color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">View plans →</a><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' },
    { delayDays: 12, subject: '⏰ 2 days left on your ' + PRODUCT + ' trial',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px">Your trial ends in 2 days</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">' + f + ', your ' + PRODUCT + ' access is about to expire. After that, you won\'t be able to process orders or access your sales data.</p><p style="font-size:14px;line-height:1.7;margin-bottom:20px">Upgrade now to keep your POS running.</p><a href="' + PRICING_URL + '" style="display:inline-block;background:' + COLOR + ';color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Upgrade now →</a><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' },
    { delayDays: 14, subject: 'Your ' + PRODUCT + ' trial has ended',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px">Your trial has ended</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">' + f + ', your ' + PRODUCT + ' free trial is now over. Your account is paused and your data is safe — subscribe to pick up right where you left off.</p><a href="' + PRICING_URL + '" style="display:inline-block;background:' + COLOR + ';color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Subscribe now →</a><p style="font-size:14px;color:#64748b;margin-top:16px">If you have any questions, just reply to this email.</p><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' },
  ];
}

function paymentFailedEmails(name) {
  var f = name.split(' ')[0] || 'there';
  return [
    { delayDays: 0, subject: 'Action needed: your ' + PRODUCT + ' payment failed',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px">Payment failed</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">' + f + ', we couldn\'t process your latest ' + PRODUCT + ' payment. Please update your card to avoid any interruption.</p><a href="' + PORTAL_URL + '/billing" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Update payment method →</a><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' },
    { delayDays: 3, subject: 'Final reminder: update your card or your ' + PRODUCT + ' account will be paused',
      html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:dc2626;margin-bottom:16px">Your account will be paused soon</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">' + f + ', we still haven\'t been able to process your payment. If we can\'t charge your card, your ' + PRODUCT + ' account will be paused.</p><a href="' + PORTAL_URL + '/billing" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Update payment method →</a><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' },
  ];
}

function cancelledEmail(name) {
  var f = name.split(' ')[0] || 'there';
  return { delayDays: 0, subject: 'We\'re sorry to see you go, ' + f,
    html: '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#334155"><h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px">Your subscription has been cancelled</h1><p style="font-size:15px;line-height:1.7;margin-bottom:16px">' + f + ', we\'re sorry to see you leave ' + PRODUCT + '. Your account will remain accessible until the end of your current billing period.</p><p style="font-size:14px;line-height:1.7;margin-bottom:20px">We\'d love to know what we could have done better. Hit reply and let us know.</p><p style="font-size:14px;margin-bottom:24px">Changed your mind? You can resubscribe anytime:</p><a href="' + PRICING_URL + '" style="display:inline-block;background:' + COLOR + ';color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none">Resubscribe →</a><p style="font-size:12px;color:#94a3b8;margin-top:32px">— The ' + PRODUCT + ' Team</p></div>' };
}

async function sendBrevo(to, toName, subject, html, scheduledAt) {
  var body = { sender: FROM, to: [{ email: to, name: toName }], subject: subject, htmlContent: html };
  if (scheduledAt) body.scheduledAt = scheduledAt;
  var res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('Brevo send failed:', res.status, await res.text());
  return res.ok;
}

function futureISO(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    var { email, name, event } = req.body;
    if (!email || !event) return res.status(400).json({ error: 'Missing email or event' });

    var displayName = name || email.split('@')[0];
    var sent = 0;

    if (event === 'trial_start') {
      var emails = trialEmails(displayName);
      for (var e of emails) { await sendBrevo(email, displayName, e.subject, e.html, futureISO(e.delayDays)); sent++; }
    } else if (event === 'payment_failed') {
      var emails = paymentFailedEmails(displayName);
      for (var e of emails) { await sendBrevo(email, displayName, e.subject, e.html, e.delayDays > 0 ? futureISO(e.delayDays) : undefined); sent++; }
    } else if (event === 'cancelled') {
      var e = cancelledEmail(displayName);
      await sendBrevo(email, displayName, e.subject, e.html);
      sent = 1;
    } else {
      return res.status(400).json({ error: 'Unknown event: ' + event });
    }

    return res.status(200).json({ ok: true, sent: sent, event: event });
  } catch (err) {
    console.error('email-sequence error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed' });
  }
};
