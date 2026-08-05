const BookingService = require('../../services/BookingService');
const bookingService = new BookingService();
const invoiceService = require('../../services/InvoiceService');
const emailService = require('../../services/EmailService');
const Booking = require('../../database/models/Booking');

const BookingController = {
    async createBooking(req, res) {
        try {
            const newBooking = await bookingService.createBooking(req.body, req.io);
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
    },

    async getBookingById(req, res) {
        try {
            const booking = await bookingService.getBookingById(req.params.id);
            res.status(200).json(booking);
        } catch (error) {
            console.error('Get booking by id error:', error);
            res.status(error.message === 'Booking not found' ? 404 : 500).json({ message: error.message });
        }
    },

    async updateBooking(req, res) {
        try {
            const updatedBooking = await bookingService.updateBooking(req.params.id, req.body, req.user.role, req.user._id);
            res.status(200).json(updatedBooking);
        } catch (error) {
            console.error('Update booking error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    async cancelBooking(req, res) {
        try {
            const { reason } = req.body;
            const cancelledBooking = await bookingService.cancelBooking(req.params.id, reason, req.user.role, req.user._id);
            res.status(200).json(cancelledBooking);
        } catch (error) {
            console.error('Cancel booking error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    async deleteBooking(req, res) {
        try {
            await bookingService.deleteBooking(req.params.id, req.user.role, req.user._id);
            res.status(200).json({ message: 'Booking deleted successfully' });
        } catch (error) {
            console.error('Delete booking error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    async getCustomers(req, res) {
        try {
            const customers = await bookingService.getCustomers(req.user.role, req.user._id);
            res.status(200).json({ success: true, customers });
        } catch (error) {
            console.error('Get customers error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async downloadInvoice(req, res) {
        try {
            const booking = await Booking.findById(req.params.id)
                .populate('userId', 'name email phone')
                .populate('listingId', 'title type description price');
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            const invNo = booking._id.toString().slice(-8).toUpperCase();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${invNo}.pdf`);

            await invoiceService.generateInvoice(booking, res);
        } catch (error) {
            console.error('Invoice download error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    async emailInvoice(req, res) {
        try {
            const { toEmail } = req.body;

            const booking = await Booking.findById(req.params.id)
                .populate('userId', 'name email phone')
                .populate('listingId', 'title type description price');
            if (!booking) return res.status(404).json({ message: 'Booking not found' });

            const recipient = toEmail ||
                booking.details?.customerEmail ||
                booking.userId?.email;

            if (!recipient) return res.status(400).json({ message: 'No recipient email found for this booking' });

            const result = await emailService.sendInvoiceEmail(booking, recipient);

            res.status(200).json({
                success: true,
                message: result.offline
                    ? `Invoice saved locally (offline mode). Check backend/email-previews/ folder.`
                    : `Invoice sent to ${recipient}`,
                previewUrl: result.previewUrl || null,
                offline: result.offline || false,
                localHtmlPath: result.localHtmlPath || null,
            });
        } catch (error) {
            console.error('Email invoice error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = BookingController;
