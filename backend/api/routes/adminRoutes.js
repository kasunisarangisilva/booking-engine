const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Vendor Management - Admin Only
router.get('/vendors', authorize('admin'), adminController.getAllVendors);
router.post('/vendors/approve', authorize('admin'), adminController.approveVendor);
router.post('/vendors/suspend', authorize('admin'), adminController.suspendVendor);
router.post('/vendors/activate', authorize('admin'), adminController.activateVendor);
router.post('/vendors/inactivate', authorize('admin'), adminController.inactivateVendor);

// Platform Settings - Admin Only
router.get('/settings', authorize('admin'), adminController.getSettings);
router.put('/settings', authorize('admin'), adminController.updateSettings);

// Reports - Accessible by Admin and Vendor (Controller filters data)
router.get('/reports', adminController.getReports);
router.get('/recent-activities', adminController.getRecentActivities);
router.get('/export-report', adminController.exportReport);

module.exports = router;
