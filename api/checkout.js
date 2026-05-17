const Stripe = require('stripe');

// Stripe Price IDs — created 17 May 2026 alongside the per-till pricing rewrite.
// All 6 IDs (3 tiers × monthly/yearly) are also seeded in the ZayPOS app's
// `pricing_tiers` table (stripe_monthly_price_id / stripe_yearly_price_id).
//
// The OLD per-user IDs (price_1TMvy...) are intentionally NOT accepted here —
// new checkouts should always use the new per-till prices. Existing subscribers
// on the legacy IDs keep renewing because the ZayPOS Stripe-webhook handler
// OR-matches against stripe_price_id as well.

const PRICE_TO_PLAN = {
  // Starter — £29/till monthly · £290/till yearly
  'price_1TY1Mz8rk99sE9j08a13UrPs': { plan: 'Starter',  interval: 'monthly' },
  'price_1TY1NX8rk99sE9j0xhCqtUpa': { plan: 'Starter',  interval: 'yearly'  },
  // Growth — £69/till monthly · £690/till yearly
  'price_1TY1Nu8rk99sE9j0axWGZSVo': { plan: 'Growth',   interval: 'monthly' },
  'price_1TY1OP8rk99sE9j0pYPmOhKx': { plan: 'Growth',   interval: 'yearly'  },
  // Complete — £99/till monthly · £990/till yearly
  'price_1TY1Op8rk99sE9j0I3G6lptb': { plan: 'Complete', interval: 'monthly' },
  'price_1TY1PB8rk99sE9j0t2wl1wQF': { plan: 'Complete', interval: 'yearly'  },
};

const ALLOWED_PRICES = new Set(Object.keys(PRICE_TO_PLAN));

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, quantity, email } = req.body;

    if (!priceId || !ALLOWED_PRICES.has(priceId)) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const qty = Math.max(1, Math.min(100, parseInt(quantity) || 1));
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { plan, interval } = PRICE_TO_PLAN[priceId];

    const params = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: qty }],
      success_url: 'https://www.zaypos.co.uk/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.zaypos.co.uk/#pricing',
      metadata: { plan, interval, priceId },
      subscription_data: {
        metadata: { plan, interval, priceId },
      },
    };

    if (email) params.customer_email = email;

    const session = await stripe.checkout.sessions.create(params);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
};
