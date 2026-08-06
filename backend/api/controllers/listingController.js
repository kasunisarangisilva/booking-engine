const ListingService = require('../../services/ListingService');
const listingService = new ListingService();

const ListingController = {
    async createListing(req, res) {
        try {
            const newListing = await listingService.createListing(req.body, req.io);
            res.status(201).json(newListing);
        } catch (error) {
            console.error('Create listing error:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message, error: error.message });
            }
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async getAllListings(req, res) {
        try {
            const { type, page, limit } = req.query;
            const result = await listingService.getAllListings(
                type,
                parseInt(page) || 1,
                parseInt(limit) || 10
            );
            res.status(200).json({
                listings: result.listings,
                pagination: {
                    total: result.total,
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 10,
                    totalPages: Math.ceil(result.total / (parseInt(limit) || 10))
                }
            });
        } catch (error) {
            console.error('Get all listings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getListingById(req, res) {
        try {
            const listing = await listingService.getListingById(req.params.id);
            res.status(200).json(listing);
        } catch (error) {
            console.error('Get listing by ID error:', error.message);
            res.status(error.message === 'Listing not found' ? 404 : 500).json({ message: error.message });
        }
    },

    async getMyListings(req, res) {
        try {
            const { page, limit } = req.query;
            const result = await listingService.getMyListings(
                req.user._id,
                parseInt(page) || 1,
                parseInt(limit) || 10
            );
            res.status(200).json({
                listings: result.listings,
                pagination: {
                    total: result.total,
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 10,
                    totalPages: Math.ceil(result.total / (parseInt(limit) || 10))
                }
            });
        } catch (error) {
            console.error('Get my listings error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getListingAvailability(req, res) {
        try {
            const result = await listingService.getAvailability(req.params.id, req.query);
            res.status(200).json(result);
        } catch (error) {
            console.error('Get availability error:', error.message);
            res.status(error.message === 'Listing not found' ? 404 : 500).json({ message: error.message });
        }
    },

    async updateListing(req, res) {
        try {
            const updatedListing = await listingService.updateListing(
                req.params.id,
                req.user._id,
                req.body,
                req.user.role
            );
            res.status(200).json(updatedListing);
        } catch (error) {
            console.error('Update listing error:', error.message);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(error.message.includes('Not authorized') ? 403 : 500).json({ message: error.message });
        }
    },

    async deleteListing(req, res) {
        try {
            await listingService.deleteListing(
                req.params.id,
                req.user._id,
                req.user.role
            );
            res.status(200).json({ success: true, message: 'Listing deleted successfully' });
        } catch (error) {
            console.error('Delete listing error:', error.message);
            res.status(error.message.includes('Not authorized') ? 403 : 500).json({ message: error.message });
        }
    }
};

module.exports = ListingController;
