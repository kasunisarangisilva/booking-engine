const Booking = require('../models/Booking');
const { Listing } = require('../models/Listing');

exports.createBooking = async (req, res) => {
    try {
        const { listingId, details, totalPrice } = req.body;
        // const userId = req.user.id; // Mocking assumption
        const userId = "user_123"; // TODO: Extract from JWT middleware

        const listing = Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const id = Date.now().toString();
        const newBooking = new Booking(id, userId, listingId, details, 'confirmed', totalPrice);

        Booking.create(newBooking);

        res.status(201).json(newBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const userId = "user_123"; // Mock
        const allBookings = Booking.findAll();
        const userBookings = allBookings.filter(b => b.userId === userId);
        res.status(200).json(userBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
