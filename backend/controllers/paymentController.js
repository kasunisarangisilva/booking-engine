const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Booking = require('../models/Booking');
const { Listing } = require('../models/Listing');
const Notification = require('../models/Notification');

// Helper to notify admin and vendor
const notifyBookingConfirmed = async (booking, io) => {
    try {
        const listing = await Listing.findById(booking.listingId);
        if (!listing) return;

        // 1. For Admin
        const adminNotif = new Notification({
            recipient: 'admin',
            type: 'booking_confirmed',
            message: `Booking confirmed for ${listing.title}`,
            data: { bookingId: booking._id, listingId: listing._id }
        });
        await adminNotif.save();

        io.to('admin').emit('notification', {
            ...adminNotif.toObject(),
            data: booking
        });

        // 2. For Vendor
        const vendorNotif = new Notification({
            recipient: listing.vendorId.toString(),
            type: 'booking_confirmed',
            message: `Payment received for ${listing.title}. Booking confirmed.`,
            data: { bookingId: booking._id, listingId: listing._id }
        });
        await vendorNotif.save();

        const vendorRoom = `vendor_${listing.vendorId}`;
        io.to(vendorRoom).emit('notification', {
            ...vendorNotif.toObject(),
            data: booking
        });
    } catch (error) {
        console.error('Notification error:', error);
    }
};

exports.createStripeSession = async (req, res) => {
    try {
        console.log('[Stripe] Creating checkout session...');
        if (!stripe) {
            console.error('[Stripe] Error: Stripe not configured');
            return res.status(503).json({ message: 'Stripe is not configured on the server. Please add STRIPE_SECRET_KEY to .env' });
        }
        const { bookingId } = req.body;
        console.log('[Stripe] Booking ID:', bookingId);

        const booking = await Booking.findById(bookingId).populate('listingId');

        if (!booking) {
            console.error('[Stripe] Error: Booking not found');
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!booking.listingId) {
            console.error('[Stripe] Error: Listing not found for booking');
            return res.status(400).json({ message: 'Listing not found for this booking' });
        }

        const origin = req.headers.origin || 'http://localhost:3000';
        console.log('[Stripe] App Origin:', origin);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: booking.listingId.title,
                        description: booking.listingId.description || 'Booking Payment',
                    },
                    unit_amount: Math.round(booking.totalPrice * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment-cancel`,
            metadata: {
                bookingId: booking._id.toString(),
            },
        });

        console.log('[Stripe] Session created successfully:', session.id);
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('[Stripe] session error:', error);
        res.status(500).json({ message: 'Stripe error', error: error.message });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    console.log('[Webhook] Received Stripe event');
    if (!stripe) {
        console.error('[Webhook] Error: Stripe not configured');
        return res.status(503).send('Stripe is not configured');
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('[Webhook] WARNING: STRIPE_WEBHOOK_SECRET is missing. Skipping signature verification (DEVELOPMENT ONLY)');
    }

    let event;

    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // Fallback for local development if secret is missing
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error('[Webhook] Error: Signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('[Webhook] Event Type:', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;
        console.log('[Webhook] Checkout completed for booking:', bookingId);

        try {
            const booking = await Booking.findById(bookingId);
            if (booking) {
                if (booking.status === 'confirmed') {
                    console.log('[Webhook] Booking already confirmed. Skipping.');
                    return res.json({ received: true });
                }

                booking.status = 'confirmed';
                booking.paymentDetails = {
                    transactionId: session.payment_intent,
                    paymentStatus: 'paid',
                    rawResponse: session
                };
                await booking.save();
                console.log('[Webhook] Booking status updated to confirmed');

                // Notify via socket
                if (req.io) {
                    await notifyBookingConfirmed(booking, req.io);
                    console.log('[Webhook] Notifications sent via Socket.io');
                } else {
                    console.warn('[Webhook] req.io not available for notifications');
                }
            } else {
                console.error('[Webhook] Error: Booking not found for ID:', bookingId);
            }
        } catch (error) {
            console.error('[Webhook] Error updating booking:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    res.json({ received: true });
};

exports.verifyStripeSession = async (req, res) => {
    const { sessionId } = req.body;
    console.log('[Verify] Verifying Stripe session:', sessionId);

    if (!stripe) {
        return res.status(503).json({ message: 'Stripe is not configured' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const bookingId = session.metadata.bookingId;
            console.log('[Verify] Session paid for booking:', bookingId);

            const booking = await Booking.findById(bookingId);
            if (booking && booking.status !== 'confirmed') {
                booking.status = 'confirmed';
                booking.paymentDetails = {
                    transactionId: session.payment_intent,
                    paymentStatus: 'paid',
                    rawResponse: session
                };
                await booking.save();
                console.log('[Verify] Booking confirmed via manual verification');

                if (req.io) {
                    await notifyBookingConfirmed(booking, req.io);
                }
                return res.json({ status: 'confirmed', booking });
            } else if (booking && booking.status === 'confirmed') {
                return res.json({ status: 'confirmed', booking });
            }
        }

        res.json({ status: 'pending' });
    } catch (error) {
        console.error('[Verify] Error verifying session:', error);
        res.status(500).json({ message: 'Error verifying session', error: error.message });
    }
};

// Skeleton for Koko Pay
exports.createKokoPayment = async (req, res) => {
    // In a real app, you would call Koko Pay API here
    // Mocking a response for now
    res.status(200).json({
        message: 'Koko Pay integration pending API keys',
        redirectUrl: 'https://paykoko.com/sandbox/dummy'
    });
};

// Skeleton for Mint Pay
exports.createMintPayPayment = async (req, res) => {
    // Mocking response
    res.status(200).json({
        message: 'Mint Pay integration pending API keys',
        redirectUrl: 'https://mintpay.lk/sandbox/dummy'
    });
};
