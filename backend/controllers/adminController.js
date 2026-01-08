const User = require('../models/User');
const Booking = require('../models/Booking');
const { Listing } = require('../models/Listing');

exports.getAllVendors = async (req, res) => {
    try {
        const users = User.findAll();
        const vendors = users.filter(u => u.role === 'vendor');
        res.status(200).json(vendors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveVendor = async (req, res) => {
    // Mock approval logic
    try {
        const { vendorId } = req.body;
        const users = User.findAll();
        const vendor = users.find(u => u.id === vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        // In a real app, we'd have an 'isApproved' flag. 
        // For now, just return success.
        res.status(200).json({ message: 'Vendor approved', vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const bookings = Booking.findAll();
        const listings = Listing.findAll();

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalBookings = bookings.length;
        const totalListings = listings.length;

        res.status(200).json({
            totalRevenue,
            totalBookings,
            totalListings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
