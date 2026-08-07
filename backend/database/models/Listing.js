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
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be greater than 0'],
        max: [1000000, 'Price cannot exceed $1,000,000']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        minlength: [2, 'Location must be at least 2 characters'],
        maxlength: [150, 'Location cannot exceed 150 characters'],
        trim: true
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
        min: [1, 'Total rooms must be at least 1'],
        max: [1000, 'Total rooms cannot exceed 1000']
    }
}));

// Cinema discriminator
const CinemaListing = Listing.discriminator('cinema', new mongoose.Schema({
    movieTitle: {
        type: String,
        required: [true, 'Movie title is required'],
        minlength: [1, 'Movie title is required'],
        maxlength: [100, 'Movie title cannot exceed 100 characters'],
        trim: true
    },
    showTime: {
        type: Date,
        required: true
    },
    seatLayout: {
        rows: { type: Number, required: true, min: [1, 'Rows must be at least 1'], max: [50, 'Rows cannot exceed 50'] },
        cols: { type: Number, required: true, min: [1, 'Cols must be at least 1'], max: [50, 'Cols cannot exceed 50'] },
        aisles: { type: [Number], default: [] }
    }
}));

// Space discriminator
const SpaceListing = Listing.discriminator('space', new mongoose.Schema({
    area: {
        type: Number,
        required: true,
        min: [1, 'Area must be at least 1 sq ft'],
        max: [1000000, 'Area cannot exceed 1,000,000 sq ft']
    },
    usageType: {
        type: String,
        enum: ['event', 'storage', 'office'],
        required: true
    },
    totalUnits: {
        type: Number,
        default: 1,
        min: [1, 'Total units must be at least 1'],
        max: [1000, 'Total units cannot exceed 1000']
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
        min: [1, 'Capacity must be at least 1 passenger'],
        max: [500, 'Capacity cannot exceed 500 passengers']
    },
    totalUnits: {
        type: Number,
        default: 1,
        min: [1, 'Total units must be at least 1'],
        max: [1000, 'Total units cannot exceed 1000']
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
        min: [1, 'Total rooms must be at least 1'],
        max: [1000, 'Total rooms cannot exceed 1000']
    }
}));

module.exports = { Listing, HotelListing, CinemaListing, SpaceListing, VehicleListing, HostelListing };
