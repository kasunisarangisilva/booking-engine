const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// TODO: Add authMiddleware
router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getUserBookings);

module.exports = router;
