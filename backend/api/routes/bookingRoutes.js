const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, bookingController.createBooking);
router.get('/vendor', protect, authorize('vendor'), bookingController.getVendorBookings);
router.get('/user/:userId', protect, bookingController.getUserBookings);
router.get('/all', protect, authorize('admin'), bookingController.getAllBookings);
router.get('/customers', protect, authorize('vendor'), bookingController.getCustomers);
router.get('/:id', protect, bookingController.getBookingById);
router.put('/:id', protect, bookingController.updateBooking);
router.put('/:id/cancel', protect, bookingController.cancelBooking);
router.delete('/:id', protect, bookingController.deleteBooking);

module.exports = router;
