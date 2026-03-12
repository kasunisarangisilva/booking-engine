const mongoose = require('mongoose');

// Base listing schema with discriminator key
const baseOptions = {
    discriminatorKey: 'type', // This field will store the listing type
    collection: 'listings',
    timestamps: true
};

const listingSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    }
}, baseOptions);

// Base Listing model
const Listing = mongoose.model('Listing', listingSchema);

// Hotel discriminator
const HotelListing = Listing.discriminator('hotel', new mongoose.Schema({
    roomType: {
        type: String,
        enum: ['single', 'double', 'king'],
        required: true
    },
    amenities: {
        type: [String],
        default: []
    },
    totalRooms: {
        type: Number,
        default: 5,
        min: 1
    }
}));

// Cinema discriminator
const CinemaListing = Listing.discriminator('cinema', new mongoose.Schema({
    movieTitle: {
        type: String,
        required: true
    },
    showTime: {
        type: Date,
        required: true
    },
    seatLayout: {
        rows: { type: Number, required: true },
        cols: { type: Number, required: true },
        aisles: { type: [Number], default: [] }
    }
}));

// Space discriminator
const SpaceListing = Listing.discriminator('space', new mongoose.Schema({
    area: {
        type: Number,
        required: true,
        min: 0
    },
    usageType: {
        type: String,
        enum: ['event', 'storage', 'office'],
        required: true
    },
    totalUnits: {
        type: Number,
        default: 1,
        min: 1
    }
}));

// Vehicle discriminator
const VehicleListing = Listing.discriminator('vehicle', new mongoose.Schema({
    vehicleType: {
        type: String,
        enum: ['car', 'van', 'bus'],
        required: true
    },
    features: {
        type: [String],
        default: []
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    totalUnits: {
        type: Number,
        default: 1,
        min: 1
    }
}));

// Hostel discriminator
const HostelListing = Listing.discriminator('hostel', new mongoose.Schema({
    roomType: {
        type: String,
        enum: ['dormitory', 'private', 'mixed'],
        default: 'dormitory'
    },
    amenities: {
        type: [String],
        default: []
    },
    totalRooms: {
        type: Number,
        default: 5,
        min: 1
    }
}));

module.exports = { Listing, HotelListing, CinemaListing, SpaceListing, VehicleListing, HostelListing };
