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
            if (!listing || !listing.vendorId) return;

            const vendorIdStr = listing.vendorId.toString();

            // Get customer name and phone from booking details or populated user object
            const bookingWithUser = await Booking.findById(booking._id).populate('userId', 'name email phone');
            const customerName = booking.details?.customerName || bookingWithUser?.userId?.name || 'Customer';
            const customerPhone = booking.details?.customerPhone || booking.phone || bookingWithUser?.userId?.phone || booking.details?.customerEmail || '';

            const isBankTransfer = booking.paymentMethod === 'bank_transfer' || booking.paymentMethod === 'cash' || booking.paymentDetails?.paymentMethod === 'bank_transfer';

            const phoneInfo = customerPhone ? ` (${customerPhone})` : '';
            const notifMessage = isBankTransfer
                ? `Bank Transfer booking for "${listing.title}" by ${customerName}${phoneInfo}. Please contact customer to collect & verify payment.`
                : `Booking confirmed for "${listing.title}" by ${customerName}.`;

            // Vendor Notification
            const existingVendorNotif = await Notification.findOne({
                recipient: vendorIdStr,
                'data.bookingId': booking._id
            });

            if (existingVendorNotif) {
                // Update existing notification status & message and re-emit so frontend updates in-place
                existingVendorNotif.type = 'booking_confirmed';
                existingVendorNotif.message = notifMessage;
                await existingVendorNotif.save();

                if (io) {
                    io.to(`vendor_${vendorIdStr}`).emit('notification', { ...existingVendorNotif.toObject(), data: bookingWithUser || booking });
                }
            } else {
                const vendorNotif = new Notification({
                    recipient: vendorIdStr,
                    type: 'booking_confirmed',
                    message: notifMessage,
                    data: {
                        bookingId: booking._id,
                        listingId: listing._id,
                        customerName: customerName,
                        paymentMethod: booking.paymentMethod
                    }
                });
                await vendorNotif.save();

                if (io) {
                    io.to(`vendor_${vendorIdStr}`).emit('notification', { ...vendorNotif.toObject(), data: bookingWithUser || booking });
                }
            }

            // SMS Notification
            const bookingWithListing = await Booking.findById(booking._id).populate('listingId');
            await smsService.sendBookingConfirmation(bookingWithListing);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
}

module.exports = PaymentService;
