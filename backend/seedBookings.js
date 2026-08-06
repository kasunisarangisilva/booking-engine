require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./database/models/Booking');

async function seed() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/booking-engine';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB:', mongoUri);

    await Booking.deleteMany({});

    const User = require('./database/models/User');
    const { Listing } = require('./database/models/Listing');

    const users = await User.find().limit(2);
    const listings = await Listing.find().limit(2);

    const getUserId = () => users.length > 0 ? users[0]._id : new mongoose.Types.ObjectId();
    const getListingId = () => listings.length > 0 ? listings[0]._id : new mongoose.Types.ObjectId();
    
    // We will create some dummy bookings
    const dummyBookings = [
        {
            userId: getUserId(),
            listingId: getListingId(),
            totalPrice: 450,
            status: 'confirmed',
            createdAt: new Date()
        },
        {
            userId: getUserId(),
            listingId: getListingId(),
            totalPrice: 25,
            status: 'confirmed',
            createdAt: new Date()
        },
        {
            userId: getUserId(),
            listingId: getListingId(),
            totalPrice: 1200,
            status: 'pending',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            userId: getUserId(),
            listingId: getListingId(),
            totalPrice: 150,
            status: 'confirmed',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
    ];

    await Booking.insertMany(dummyBookings);
    console.log('Dummy bookings inserted successfully');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
