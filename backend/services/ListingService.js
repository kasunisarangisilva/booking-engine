const ListingRepository = require('../database/repository/AdminRepository'); // Wait, typo in intent, should be ListingRepository
const Notification = require('../database/models/Notification');
const Booking = require('../database/models/Booking');
const { Listing } = require('../database/models/Listing'); // Need model directly for some complex queries if not in Repo
const ListingRepo = require('../database/repository/ListingRepository');

class ListingService {
    constructor() {
        this.listingRepo = new ListingRepo();
    }

    async createListing(listingData, io) {
        const { type, ...data } = listingData;
        const newListing = await this.listingRepo.create(type, data);

        // Notify Admin
        const notif = new Notification({
            recipient: 'admin',
            type: 'new_listing',
            message: `New listing created: ${newListing.title}`,
            data: { listingId: newListing._id }
        });
        await notif.save();

        if (io) {
            io.to('admin').emit('notification', {
                ...notif.toObject(),
                data: newListing
            });
        }

        return newListing;
    }

    async getAllListings(type, page, limit) {
        const skip = (page - 1) * limit;
        const query = type ? { type } : {};
        
        const listings = await this.listingRepo.findAll(query, skip, limit);
        const total = await this.listingRepo.count(query);

        return { listings, total };
    }

    async getListingById(id) {
        const listing = await this.listingRepo.findById(id);
        if (!listing) throw new Error('Listing not found');
        return listing;
    }

    async getMyListings(vendorId, page, limit) {
        const skip = (page - 1) * limit;
        const query = { vendorId };
        
        const listings = await this.listingRepo.findAll(query, skip, limit);
        const total = await this.listingRepo.count(query);

        return { listings, total };
    }

    async getAvailability(id, params) {
        const { date, checkIn, checkOut, pickupDate, eventDate } = params;
        const listing = await this.listingRepo.findById(id);
        if (!listing) throw new Error('Listing not found');

        const query = { 
            listingId: id, 
            status: { $in: ['confirmed', 'pending', 'awaiting_payment'] } 
        };

        if (date && listing.type === 'cinema') {
            query['details.date'] = date;
        }

        const bookings = await Booking.find(query);

        if (listing.type === 'cinema') {
            const takenSeats = bookings.reduce((acc, b) => {
                if (b.details && b.details.seats) return [...acc, ...b.details.seats];
                return acc;
            }, []);
            return { type: 'cinema', takenSeats };
        } else if (listing.type === 'hotel' || listing.type === 'hostel') {
            const overlapping = checkIn && checkOut
                ? bookings.filter(b => {
                    const bIn = b.details.checkIn;
                    const bOut = b.details.checkOut;
                    if (!bIn || !bOut) return false;
                    return bIn < checkOut && bOut > checkIn;
                })
                : bookings;
            const bookedRooms = overlapping.map(b => b.details.roomNumber).filter(Boolean);
            const totalRooms = listing.totalRooms || 5;
            return { type: listing.type, bookedRooms, totalRooms };
        } else {
            const filterDate = pickupDate || eventDate;
            const overlapping = filterDate
                ? bookings.filter(b => (b.details.pickupDate || b.details.eventDate) === filterDate)
                : bookings;
            const bookedUnits = overlapping.map(b => b.details.unitNumber).filter(Boolean);
            const totalUnits = listing.totalUnits || 1;
            const takenDates = bookings.map(b => ({ start: b.details.pickupDate || b.details.eventDate }));
            return { type: listing.type, bookedUnits, totalUnits, takenDates };
        }
    }

    async updateListing(id, vendorId, updateData, userRole) {
        const listing = await Listing.findById(id);
        if (!listing) throw new Error('Listing not found');
        if (userRole !== 'admin' && listing.vendorId.toString() !== vendorId.toString()) {
            throw new Error('Not authorized to update this listing');
        }
        
        delete updateData.vendorId;
        delete updateData.type;
        
        Object.assign(listing, updateData);
        return await listing.save();
    }

    async deleteListing(id, vendorId, userRole) {
        const listing = await Listing.findById(id);
        if (!listing) throw new Error('Listing not found');
        if (userRole !== 'admin' && listing.vendorId.toString() !== vendorId.toString()) {
            throw new Error('Not authorized to delete this listing');
        }
        
        await Listing.findByIdAndDelete(id);
        return true;
    }
}

module.exports = ListingService;
