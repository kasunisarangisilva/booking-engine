const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Booking = require('../database/models/Booking');
const { Listing } = require('../database/models/Listing');
const Notification = require('../database/models/Notification');
const smsService = require('../utils/smsService');

class PaymentService {
    async createStripeSession(bookingId, origin) {
        if (!stripe) throw new Error('Stripe is not configured');

        const booking = await Booking.findById(bookingId).populate('listingId');
        if (!booking) throw new Error('Booking not found');
        if (!booking.listingId) throw new Error('Listing not found for this booking');

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
            metadata: { bookingId: booking._id.toString() },
        });

        return session;
    }

    async verifyStripeSession(sessionId, io) {
        if (!stripe) throw new Error('Stripe is not configured');

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            const bookingId = session.metadata.bookingId;
            const booking = await Booking.findById(bookingId);
            if (booking && booking.status !== 'confirmed') {
                booking.status = 'confirmed';
                booking.paymentDetails = {
                    transactionId: session.payment_intent,
                    paymentStatus: 'paid',
                    rawResponse: session
                };
                await booking.save();
                if (io) await this.notifyBookingConfirmed(booking, io);
                return { status: 'confirmed', booking };
            } else if (booking && booking.status === 'confirmed') {
                return { status: 'confirmed', booking };
            }
        }
        return { status: 'pending' };
    }

    async notifyBookingConfirmed(booking, io) {
        try {
            const listing = await Listing.findById(booking.listingId);
            if (!listing) return;

            // Admin Notif
            const adminNotif = new Notification({
                recipient: 'admin',
                type: 'booking_confirmed',
                message: `Booking confirmed for ${listing.title}`,
                data: { bookingId: booking._id, listingId: listing._id }
            });
            await adminNotif.save();
            io.to('admin').emit('notification', { ...adminNotif.toObject(), data: booking });

            // Vendor Notif
            const vendorNotif = new Notification({
                recipient: listing.vendorId.toString(),
                type: 'booking_confirmed',
                message: `Payment received for ${listing.title}. Booking confirmed.`,
                data: { bookingId: booking._id, listingId: listing._id }
            });
            await vendorNotif.save();
            io.to(`vendor_${listing.vendorId}`).emit('notification', { ...vendorNotif.toObject(), data: booking });

            // SMS
            const bookingWithListing = await Booking.findById(booking._id).populate('listingId');
            await smsService.sendBookingConfirmation(bookingWithListing);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
}

module.exports = PaymentService;
