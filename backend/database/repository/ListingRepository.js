const { Listing, HotelListing, CinemaListing, SpaceListing, VehicleListing, HostelListing } = require('../models/Listing');

class ListingRepository {
    async create(type, data) {
        let newListing;
        switch (type) {
            case 'hotel':
                if (!['single', 'double', 'king'].includes(data.roomType)) {
                    data.roomType = 'single';
                }
                newListing = new HotelListing(data);
                break;
            case 'hostel':
                if (!['dormitory', 'private', 'mixed'].includes(data.roomType)) {
                    data.roomType = 'dormitory';
                }
                newListing = new HostelListing(data);
                break;
            case 'cinema':
                newListing = new CinemaListing(data);
                break;
            case 'space':
                newListing = new SpaceListing(data);
                break;
            case 'vehicle':
                newListing = new VehicleListing(data);
                break;
            default:
                throw new Error('Invalid listing type');
        }
        return await newListing.save();
    }

    async findAll(query, skip, limit) {
        return await Listing.find(query)
            .populate('vendorId', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
    }

    async count(query) {
        return await Listing.countDocuments(query);
    }

    async findById(id) {
        return await Listing.findById(id).populate('vendorId', 'name email');
    }
}

module.exports = ListingRepository;
