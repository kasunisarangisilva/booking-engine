/**
 * SMS Service - Simulation Mode
 * 
 * This service is designed to simulate SMS sending by logging to the console.
 * It can be easily extended to use Twilio or any other SMS gateway by adding API keys to .env.
 */

exports.sendBookingConfirmation = async (booking) => {
    try {
        const phone = booking.phone || (booking.details && booking.details.phone);
        const listingTitle = booking.listingId && booking.listingId.title ? booking.listingId.title : 'your booked item';
        
        if (!phone) {
            console.warn('[SMS SIMULATOR] Skipping SMS: No phone number provided for booking:', booking._id);
            return;
        }

        const message = `Confirmation from ExploreLanka: Your booking for "${listingTitle}" is confirmed! Booking ID: ${booking._id.toString().slice(-6).toUpperCase()}`;

        console.log('\n' + '='.repeat(50));
        console.log('📱 [SMS SIMULATOR] SENDING MESSAGE...');
        console.log(`TO      : ${phone}`);
        console.log(`MESSAGE : ${message}`);
        console.log('='.repeat(50) + '\n');

        // Note: For real Twilio integration, you would add:
        // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE, to: phone });

        return { success: true, simulated: true };
    } catch (error) {
        console.error('[SMS SIMULATOR] Error:', error);
        return { success: false, error: error.message };
    }
};
