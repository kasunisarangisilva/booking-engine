const BookingService = require('../../services/BookingService');
const bookingService = new BookingService();

const BookingController = {
    async createBooking(req, res) {
        try {
            const newBooking = await bookingService.createBooking(req.body);
            res.status(201).json(newBooking);
        } catch (error) {
            console.error('Create booking error:', error.message);
            res.status(error.message === 'Listing not found' ? 404 : 400).json({ message: error.message });
        }
    },

    async getUserBookings(req, res) {
        try {
            const bookings = await bookingService.getUserBookings(req.params.userId || req.user._id);
            res.status(200).json(bookings);
        } catch (error) {
            console.error('Get user bookings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getAllBookings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await bookingService.getAllBookings(page, limit);
            res.status(200).json({
                bookings: result.bookings,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: page
            });
        } catch (error) {
            console.error('Get all bookings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getVendorBookings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await bookingService.getVendorBookings(req.user._id, page, limit);
            res.status(200).json({
                bookings: result.bookings,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: page
            });
        } catch (error) {
            console.error('Get vendor bookings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = BookingController;
