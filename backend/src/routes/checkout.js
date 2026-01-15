import { Router } from 'express';
import Stripe from 'stripe';
import prisma from '../db/client.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const { priceId, quantity = 1 } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payments?canceled=true`,
      customer_email: dbUser.email,
      metadata: {
        userId: dbUser.id,
      },
    });

    await prisma.payment.create({
      data: {
        userId: dbUser.id,
        stripeCheckoutId: session.id,
        amount: session.amount_total || 0,
        status: 'pending',
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    await prisma.payment.update({
      where: { stripeCheckoutId: session.id },
      data: {
        status: 'completed',
        stripePaymentIntentId: session.payment_intent,
        amount: session.amount_total,
      },
    });

    console.log(`Payment completed for user: ${session.metadata.userId}`);
  }

  res.json({ received: true });
});

router.get('/status', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    const hasPaid = payments.some((p) => p.status === 'completed');

    res.json({ hasPaid, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
