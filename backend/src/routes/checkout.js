import { Router } from 'express';
import Stripe from 'stripe';
import prisma from '../db/client.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const { priceId, quantity = 1, sessionId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: dbUser.id,
        sessionId: sessionId,
        status: 'completed',
      },
    });

    if (existingPayment) {
      return res
        .status(400)
        .json({ error: 'You have already paid for this session' });
    }

    const origin =
      req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';

    const stripeSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/sessions/${sessionId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sessions/${sessionId}?payment=canceled`,
      customer_email: dbUser.email,
      metadata: {
        userId: dbUser.id,
        sessionId: sessionId,
      },
    });

    await prisma.payment.create({
      data: {
        userId: dbUser.id,
        sessionId: sessionId,
        stripeCheckoutId: stripeSession.id,
        amount: stripeSession.amount_total || 0,
        status: 'pending',
      },
    });

    res.json({ url: stripeSession.url });
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

    console.log(
      `Payment completed for user: ${session.metadata.userId}, session: ${session.metadata.sessionId}`
    );
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

router.get('/session/:sessionId/status', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;
    const { sessionId } = req.params;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: supabaseUser.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        userId: dbUser.id,
        sessionId: sessionId,
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasPaid = payment?.status === 'completed';

    res.json({ hasPaid, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  '/session/:sessionId/all-statuses',
  authenticateUser,
  async (req, res) => {
    try {
      const supabaseUser = req.user;
      const { sessionId } = req.params;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
      });

      if (!dbUser) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      if (!dbUser.isAdmin) {
        return res
          .status(403)
          .json({ error: 'Only admins can view all payment statuses' });
      }

      const payments = await prisma.payment.findMany({
        where: {
          sessionId: sessionId,
          status: 'completed',
        },
        select: {
          userId: true,
          status: true,
        },
      });

      const paymentStatusMap = {};
      payments.forEach((payment) => {
        paymentStatusMap[payment.userId] = payment.status === 'completed';
      });

      res.json({ paymentStatusMap });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
