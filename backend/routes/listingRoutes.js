const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const adminController = require('../controllers/adminController');

const { authMiddleware, vendorMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, vendorMiddleware, listingController.createListing);
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);

// Protect admin routes
router.use(authMiddleware, adminMiddleware);

router.get('/vendors', adminController.getAllVendors);
router.post('/vendors/approve', adminController.approveVendor);
router.get('/reports', adminController.getReports);

module.exports = router;
