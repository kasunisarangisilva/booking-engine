const PaymentService = require('../../services/PaymentService');
const paymentService = new PaymentService();
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Booking = require('../../database/models/Booking');

const PaymentController = {
    async createStripeSession(req, res) {
        try {
            const { bookingId } = req.body;
            const origin = req.headers.origin || 'http://localhost:3000';
            const session = await paymentService.createStripeSession(bookingId, origin);
            res.status(200).json({ url: session.url });
        } catch (error) {
            console.error('[Stripe] session error:', error.message);
            res.status(500).json({ message: error.message });
        }
    },

    async handleStripeWebhook(req, res) {
        if (!stripe) return res.status(503).send('Stripe is not configured');
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        let event;

        try {
            if (webhookSecret) {
                event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            } else {
                event = JSON.parse(req.body.toString());
            }
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const bookingId = session.metadata.bookingId;
            try {
                const booking = await Booking.findById(bookingId);
                if (booking && booking.status !== 'confirmed') {
                    booking.status = 'confirmed';
                    booking.paymentDetails = { transactionId: session.payment_intent, paymentStatus: 'paid', rawResponse: session };
                    await booking.save();
                    if (req.io) await paymentService.notifyBookingConfirmed(booking, req.io);
                }
            } catch (error) {
                console.error('[Webhook] Error:', error);
            }
        }
        res.json({ received: true });
    },

    async verifyStripeSession(req, res) {
        try {
            const result = await paymentService.verifyStripeSession(req.body.sessionId, req.io);
            res.json(result);
        } catch (error) {
            console.error('[Verify] Error:', error.message);
            res.status(500).json({ message: error.message });
        }
    },

    async createKokoPayment(req, res) {
        res.status(200).json({ message: 'Koko Pay integration pending', redirectUrl: 'https://paykoko.com/sandbox/dummy' });
    },

    async createMintPayPayment(req, res) {
        res.status(200).json({ message: 'Mint Pay integration pending', redirectUrl: 'https://mintpay.lk/sandbox/dummy' });
    },

    async confirmLocalPayment(req, res) {
        try {
            const { bookingId, paymentMethod } = req.body;
            const booking = await Booking.findById(bookingId);
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            booking.status = 'confirmed';
            booking.paymentDetails = {
                paymentStatus: 'paid',
                paymentMethod: paymentMethod || booking.paymentMethod || 'bank_transfer',
                transactionId: `LOCAL_${Date.now()}`
            };
            await booking.save();

            if (req.io) {
                await paymentService.notifyBookingConfirmed(booking, req.io);
            }

            res.status(200).json({ success: true, booking, message: 'Booking confirmed successfully for local demo' });
        } catch (error) {
            console.error('[Local Payment] Error:', error.message);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = PaymentController;
