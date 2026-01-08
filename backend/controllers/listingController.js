const { Listing, HotelListing, CinemaListing, SpaceListing, VehicleListing } = require('../models/Listing');

exports.createListing = async (req, res) => {
    try {
        const { vendorId, title, description, type, price, location, ...details } = req.body;
        // In a real app, vendorId would come from req.user.id

        const id = Date.now().toString();
        let newListing;

        switch (type) {
            case 'hotel':
                newListing = new HotelListing(id, vendorId, title, description, price, location, details.roomType, details.amenities);
                break;
            case 'cinema':
                newListing = new CinemaListing(id, vendorId, title, description, price, location, details.movieTitle, details.showTime, details.seatLayout);
                break;
            case 'space':
                newListing = new SpaceListing(id, vendorId, title, description, price, location, details.area, details.usageType);
                break;
            case 'vehicle':
                newListing = new VehicleListing(id, vendorId, title, description, price, location, details.vehicleType, details.features, details.capacity);
                break;
            default:
                return res.status(400).json({ message: 'Invalid listing type' });
        }

        Listing.create(newListing);
        res.status(201).json(newListing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllListings = async (req, res) => {
    try {
        const listings = Listing.findAll();
        res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getListingById = async (req, res) => {
    try {
        const listing = Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
