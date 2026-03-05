const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-stripe-session', protect, paymentController.createStripeSession);
router.post('/verify-session', protect, paymentController.verifyStripeSession);
router.post('/koko/initiate', protect, paymentController.createKokoPayment);
router.post('/mintpay/initiate', protect, paymentController.createMintPayPayment);

module.exports = router;
