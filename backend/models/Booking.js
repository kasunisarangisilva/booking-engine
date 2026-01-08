const fs = require('fs');
const path = require('path');

const bookingsFilePath = path.join(__dirname, '../data/bookings.json');

if (!fs.existsSync(path.dirname(bookingsFilePath))) {
    fs.mkdirSync(path.dirname(bookingsFilePath), { recursive: true });
    fs.writeFileSync(bookingsFilePath, '[]');
}

class Booking {
    constructor(id, userId, listingId, details, status, totalPrice) {
        this.id = id;
        this.userId = userId;
        this.listingId = listingId;
        this.details = details; // { date: '...', seatNumbers: [], etc. }
        this.status = status; // 'confirmed', 'pending', 'cancelled'
        this.totalPrice = totalPrice;
        this.createdAt = new Date();
    }

    static findAll() {
        try {
            const data = fs.readFileSync(bookingsFilePath);
            return JSON.parse(data);
        } catch (err) {
            return [];
        }
    }

    static findById(id) {
        return this.findAll().find(b => b.id === id);
    }

    static create(booking) {
        const bookings = this.findAll();
        bookings.push(booking);
        fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2));
        return booking;
    }
}

module.exports = Booking;
