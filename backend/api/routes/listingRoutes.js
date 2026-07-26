const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', listingController.getAllListings);
router.get('/my', protect, listingController.getMyListings); 
router.get('/:id', listingController.getListingById);
router.get('/:id/availability', listingController.getListingAvailability);

// Protected routes (Create, Update, Delete)
router.post('/', protect, authorize('vendor', 'admin'), listingController.createListing);
router.put('/:id', protect, authorize('vendor', 'admin'), listingController.updateListing);
router.delete('/:id', protect, authorize('vendor', 'admin'), listingController.deleteListing);

module.exports = router;
