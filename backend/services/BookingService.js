const BookingRepository = require('../database/repository/BookingRepository');
const { Listing } = require('../database/models/Listing');

class BookingService {
    constructor() {
        this.bookingRepo = new BookingRepository();
    }

    async createBooking(bookingData) {
        const { userId, listingId, details, totalPrice, paymentMethod, phone } = bookingData;

        const listing = await Listing.findById(listingId);
        if (!listing) throw new Error('Listing not found');

        const existingBookings = await this.bookingRepo.findByListingAndStatus(listingId, ['confirmed', 'pending', 'awaiting_payment']);

        // Availability check logic
        this.checkAvailability(listing, details, existingBookings);

        const newBooking = await this.bookingRepo.create({
            userId, listingId, details, status: 'awaiting_payment',
            paymentMethod: paymentMethod || 'card', totalPrice, phone
        });

        await newBooking.populate('listingId', 'title type price');
        await newBooking.populate('userId', 'name email');

        return newBooking;
    }

    checkAvailability(listing, details, existingBookings) {
        if (listing.type === 'cinema') {
            const { seats = [], date } = details;
            if (!date) throw new Error('Date is required for cinema booking.');
            const alreadyTaken = existingBookings.some(b => b.details.date === date && (b.details.seats || []).some(s => seats.includes(s)));
            if (alreadyTaken) throw new Error('One or more selected seats are already booked.');
        } else if (listing.type === 'hotel' || listing.type === 'hostel') {
            const { roomNumber, checkIn, checkOut } = details;
            if (!roomNumber || !checkIn || !checkOut) throw new Error('Room and dates are required.');
            const roomConflict = existingBookings.some(b => b.details.roomNumber === roomNumber && b.details.checkIn < checkOut && b.details.checkOut > checkIn);
            if (roomConflict) throw new Error(`Room ${roomNumber} is already booked.`);
        } else {
            const unitNumber = details.unitNumber;
            const reqDate = details.pickupDate || details.eventDate;
            if (!unitNumber || !reqDate) throw new Error('Unit and date are required.');
            const unitConflict = existingBookings.some(b => b.details.unitNumber === unitNumber && (b.details.pickupDate || b.details.eventDate) === reqDate);
            if (unitConflict) throw new Error(`Unit #${unitNumber} is already booked.`);
        }
    }

    async getUserBookings(userId) {
        return await this.bookingRepo.findByUser(userId);
    }

    async getAllBookings(page, limit) {
        const skip = (page - 1) * limit;
        const bookings = await this.bookingRepo.findAllPaginated(skip, limit);
        const total = await this.bookingRepo.countAll();
        return { bookings, total, totalPages: Math.ceil(total / limit) };
    }

    async getVendorBookings(vendorId, page, limit) {
        const skip = (page - 1) * limit;
        const listings = await Listing.find({ vendorId }).select('_id');
        const listingIds = listings.map(l => l._id);

        const bookings = await this.bookingRepo.findByListingIdsPaginated(listingIds, skip, limit);
        const total = await this.bookingRepo.countByListingIds(listingIds);
        return { bookings, total, totalPages: Math.ceil(total / limit) };
    }

    async getBookingById(id) {
        const booking = await this.bookingRepo.findById(id);
        if (!booking) throw new Error('Booking not found');
        return booking;
    }

    async updateBooking(id, updateData, userRole, userId) {
        const booking = await this.getBookingById(id);
        
        // Authorization check (Admin can edit any, Vendor can edit their own listing's bookings)
        if (userRole === 'vendor') {
            if (booking.listingId.vendorId.toString() !== userId.toString()) {
                throw new Error('Not authorized to update this booking');
            }
        } else if (userRole !== 'admin') {
            throw new Error('Not authorized to update this booking');
        }

        // Avoid changing status through general update
        delete updateData.status;
        delete updateData.cancellationReason;
        
        return await this.bookingRepo.update(id, updateData);
    }

    async cancelBooking(id, reason, userRole, userId) {
        const booking = await this.getBookingById(id);
        
        // Authorization check
        if (userRole === 'vendor') {
            if (booking.listingId.vendorId.toString() !== userId.toString()) {
                throw new Error('Not authorized to cancel this booking');
            }
        } else if (userRole !== 'admin') {
            throw new Error('Not authorized to cancel this booking');
        }

        if (!reason || reason.trim() === '') {
            throw new Error('Cancellation reason is required');
        }

        const updateData = {
            status: 'cancelled',
            cancellationReason: reason
        };

        return await this.bookingRepo.update(id, updateData);
    }

    async deleteBooking(id, userRole, userId) {
        const booking = await this.getBookingById(id);
        
        // Authorization check
        if (userRole === 'vendor') {
            if (booking.listingId.vendorId.toString() !== userId.toString()) {
                throw new Error('Not authorized to delete this booking');
            }
        } else if (userRole !== 'admin') {
            throw new Error('Not authorized to delete this booking');
        }

        if (booking.status !== 'cancelled') {
            throw new Error('Only cancelled bookings can be deleted');
        }

        await this.bookingRepo.delete(id);
        return true;
    }

    async getCustomers(userRole, userId) {
        let query = {};
        if (userRole === 'vendor') {
            const vendorListings = await Listing.find({ vendorId: userId }).select('_id');
            const listingIds = vendorListings.map(l => l._id);
            query = { listingId: { $in: listingIds } };
        }

        const BookingModel = require('../database/models/Booking');
        const bookings = await BookingModel.find(query)
            .populate('userId', 'name email phone createdAt')
            .populate('listingId', 'title type')
            .sort({ createdAt: -1 });

        const isSyntheticEmail = (email) => {
            if (!email) return true;
            return email.endsWith('@guest.internal') ||
                email.startsWith('widget_') ||
                email.startsWith('guest_') ||
                /^guest_\d+@example\.com$/.test(email);
        };

        const customersMap = {};

        bookings.forEach(b => {
            const u = b.userId;

            // Extract contact details typed into the widget form or profile
            const formEmail = b.details?.customerEmail;
            const formName = b.details?.customerName;
            const formPhone = b.details?.customerPhone;

            const rawEmail = formEmail || u?.email || '';
            const cleanEmail = (rawEmail && !isSyntheticEmail(rawEmail)) ? rawEmail : (formEmail || 'N/A');

            const rawName = formName || u?.name || 'Guest Customer';
            const cleanName = (rawName && !rawName.startsWith('Guest_')) ? rawName : 'Guest Customer';

            const cleanPhone = formPhone || b.phone || u?.phone || 'N/A';

            const key = (cleanEmail && cleanEmail !== 'N/A' && !isSyntheticEmail(cleanEmail))
                ? cleanEmail.toLowerCase()
                : (u?._id?.toString() || cleanPhone || 'guest');

            if (!customersMap[key]) {
                customersMap[key] = {
                    id: u?._id || key,
                    name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    totalBookings: 0,
                    totalSpent: 0,
                    lastBookingDate: b.createdAt,
                    listingsBooked: new Set()
                };
            }

            customersMap[key].totalBookings += 1;
            if (b.status === 'confirmed') {
                customersMap[key].totalSpent += (b.totalPrice || 0);
            }
            if (b.listingId?.title) {
                customersMap[key].listingsBooked.add(b.listingId.title);
            }
        });

        return Object.values(customersMap).map(c => ({
            ...c,
            listingsBooked: Array.from(c.listingsBooked)
        }));
    }
}

module.exports = BookingService;
