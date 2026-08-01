const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    // Use a singleton pattern — only one settings doc exists
    _id: { type: String, default: 'platform_settings' },

    platformName: {
        type: String,
        default: 'Multi-Vendor Booking Platform',
        trim: true,
    },
    supportEmail: {
        type: String,
        default: '',
        trim: true,
    },
    defaultCurrency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'LKR', 'INR', 'AUD', 'CAD', 'SGD'],
    },
    commissionRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100,
    },
    allowNewVendors: {
        type: Boolean,
        default: true,
    },
    requireVendorApproval: {
        type: Boolean,
        default: true,
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true, _id: false });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
