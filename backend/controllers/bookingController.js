const Booking = require('../models/Booking');
const { Listing } = require('../models/Listing');
const Notification = require('../models/Notification');

exports.createBooking = async (req, res) => {
    try {
        const { userId, listingId, details, totalPrice, paymentMethod } = req.body;
        // In production: const userId = req.user.id; // Extract from JWT middleware

        // Verify listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Create new booking with awaiting_payment status
        const newBooking = new Booking({
            userId,
            listingId,
            details,
            status: 'awaiting_payment',
            paymentMethod: paymentMethod || 'card',
            totalPrice,
            phone: req.body.phone
        });

        await newBooking.save();

        // Populate listing and user details
        await newBooking.populate('listingId', 'title type price');
        await newBooking.populate('userId', 'name email');

        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from URL params
        // In production: const userId = req.user.id; // Extract from JWT middleware

        const userBookings = await Booking.find({ userId })
            .populate('listingId', 'title type price location')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 }); // Most recent first

        res.status(200).json(userBookings);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalBookings = await Booking.countDocuments();
        const bookings = await Booking.find()
            .populate('listingId', 'title type price vendorId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            bookings,
            total: totalBookings,
            totalPages: Math.ceil(totalBookings / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Step 1: Get all listing IDs for this vendor
        const listings = await Listing.find({ vendorId }).select('_id');
        const listingIds = listings.map(l => l._id);

        // Step 2: Count total bookings for these listings
        const totalBookings = await Booking.countDocuments({ listingId: { $in: listingIds } });

        // Step 3: Find paginated bookings for these listings
        const bookings = await Booking.find({ listingId: { $in: listingIds } })
            .populate('listingId', 'title type price location')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            bookings,
            total: totalBookings,
            totalPages: Math.ceil(totalBookings / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get vendor bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
