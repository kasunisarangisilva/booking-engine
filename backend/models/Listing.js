const fs = require('fs');
const path = require('path');

const listingsFilePath = path.join(__dirname, '../data/listings.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(listingsFilePath))) {
    fs.mkdirSync(path.dirname(listingsFilePath), { recursive: true });
    fs.writeFileSync(listingsFilePath, '[]');
}

class Listing {
    constructor(id, vendorId, title, description, type, price, location) {
        this.id = id;
        this.vendorId = vendorId;
        this.title = title;
        this.description = description;
        this.type = type; // 'hotel', 'cinema', 'space', 'vehicle'
        this.price = price;
        this.location = location;
        this.createdAt = new Date();
    }

    static findAll() {
        try {
            const data = fs.readFileSync(listingsFilePath);
            return JSON.parse(data);
        } catch (err) {
            return [];
        }
    }

    static findById(id) {
        const listings = this.findAll();
        return listings.find(l => l.id === id);
    }

    static create(listing) {
        const listings = this.findAll();
        listings.push(listing);
        fs.writeFileSync(listingsFilePath, JSON.stringify(listings, null, 2));
        return listing;
    }
}

class HotelListing extends Listing {
    constructor(id, vendorId, title, description, price, location, roomType, amenities) {
        super(id, vendorId, title, description, 'hotel', price, location);
        this.roomType = roomType; // 'single', 'double', 'king'
        this.amenities = amenities; // array
    }
}

class CinemaListing extends Listing {
    constructor(id, vendorId, title, description, price, location, movieTitle, showTime, seatLayout) {
        super(id, vendorId, title, description, 'cinema', price, location);
        this.movieTitle = movieTitle;
        this.showTime = showTime;
        this.seatLayout = seatLayout; // { rows: 10, cols: 10, aisles: [] }
    }
}

class SpaceListing extends Listing {
    constructor(id, vendorId, title, description, price, location, area, usageType) {
        super(id, vendorId, title, description, 'space', price, location);
        this.area = area; // sq ft
        this.usageType = usageType; // 'event', 'storage', 'office'
    }
}

class VehicleListing extends Listing {
    constructor(id, vendorId, title, description, price, location, vehicleType, features, capacity) {
        super(id, vendorId, title, description, 'vehicle', price, location);
        this.vehicleType = vehicleType; // 'car', 'van', 'bus'
        this.features = features;
        this.capacity = capacity;
    }
}

module.exports = { Listing, HotelListing, CinemaListing, SpaceListing, VehicleListing };
