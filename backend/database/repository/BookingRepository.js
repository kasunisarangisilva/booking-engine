const Booking = require('../models/Booking');

class BookingRepository {
    async create(data) {
        const booking = new Booking(data);
        return await booking.save();
    }

    async findByListingAndStatus(listingId, statusList) {
        return await Booking.find({ 
            listingId, 
            status: { $in: statusList } 
        });
    }

    async findByUser(userId) {
        return await Booking.find({ userId })
            .populate('listingId', 'title type price location')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
    }

    async findAllPaginated(skip, limit) {
        return await Booking.find()
            .populate('listingId', 'title type price vendorId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async countAll() {
        return await Booking.countDocuments();
    }

    async findByListingIdsPaginated(listingIds, skip, limit) {
        return await Booking.find({ listingId: { $in: listingIds } })
            .populate('listingId', 'title type price location')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async countByListingIds(listingIds) {
        return await Booking.countDocuments({ listingId: { $in: listingIds } });
    }
    
    async findById(id) {
        return await Booking.findById(id);
    }
}

module.exports = BookingRepository;
