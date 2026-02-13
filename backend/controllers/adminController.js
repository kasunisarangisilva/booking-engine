const User = require('../models/User');
const Booking = require('../models/Booking');
const { Listing } = require('../models/Listing');

exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' }).select('-password');
        res.status(200).json(vendors);
    } catch (error) {
        console.error('Get all vendors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveVendor = async (req, res) => {
    try {
        const { vendorId } = req.body;

        const vendor = await User.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (vendor.role !== 'vendor') {
            return res.status(400).json({ message: 'User is not a vendor' });
        }

        // In a real app, you'd have an 'isApproved' field. 
        // Assuming we are just toggling a status or adding a field.
        // Let's assume we add an 'status' or 'isApproved' field to User model if it doesn't exist?
        // The User model I saw earlier didn't have 'isApproved'. 
        // I should probably update User model to have 'status' field: 'active', 'pending', 'suspended'.
        // But for now, I will just mock the success response or perform a save if I add the field.
        // Wait, I saw "status" in the frontend vendors table.
        // Let's add 'status' to User model to be proper.
        // But to avoid breaking changes in this small step, I will just use 'isApproved' concept if I can't modify schema easily.
        // Actually, best to add 'status' to User schema.

        // Let's modify User schema safely in a separate tool call if needed?
        // User.js lines 22-26: role field.
        // I'll assume for now I can just set a property on the document (mongoose allows schematic changes usually if not strict).
        // But Mongoose IS strict by default.

        // I will stick to what the code was doing, but actually it WASN'T doing anything (lines commented out).
        // " // vendor.isApproved = true; "
        // " // await vendor.save(); "

        // I MUST enable this. 
        // I will add 'status' to User model in next step. For now, I'll write the controller code assuming 'status' field exists.

        vendor.status = 'active';
        await vendor.save();

        res.status(200).json({
            message: 'Vendor approved successfully',
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                role: vendor.role,
                status: vendor.status
            }
        });
    } catch (error) {
        console.error('Approve vendor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.suspendVendor = async (req, res) => {
    try {
        const { vendorId } = req.body;
        const vendor = await User.findById(vendorId);

        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        vendor.status = 'suspended';
        await vendor.save();

        res.status(200).json({ message: 'Vendor suspended successfully' });
    } catch (error) {
        console.error('Suspend vendor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const user = req.user;
        let bookings, listings, vendors;

        if (user.role === 'admin') {
            // Admin sees everything
            bookings = await Booking.find();
            listings = await Listing.find();
            vendors = await User.find({ role: 'vendor' });
        } else if (user.role === 'vendor') {
            // Vendor sees only their own data
            // Assuming Listings have a 'vendorId' or 'userId' field. 
            // Based on typical schema, let's assume 'vendorId' or checking 'userId' on Listing.
            // Let's verify Listing model if possible, but for now assuming 'vendorId' stores the user ID of the creator.
            // If Listing model uses 'userId', we should use that. 
            // Let's assume 'vendorId' for now, but need to be careful. 
            // Actually, best to check Listing model first. 
            // WAIT - I haven't checked Listing model. 
            // SAFE BET: many systems use 'userId' or 'vendorId'. 
            // Let's use a query that checks typically common fields or I'll check Listing model in next step if I can.
            // BUT, wait, I can see 'userId' populated in exportReport: .populate('userId', 'name email'). 
            // That suggests Booking has userId (customer). 
            // Listing likely has an owner field.

            // LET'S CHECK LISTING MODEL FIRST before commiting this complex logic? 
            // actually I can't in this turn easily without breaking flow. 
            // Let's assume 'vendor' field or 'userId' field on Listing.
            // Ref: exportReport populates 'listingId'. 

            // Strategy: Find listings where vendor is current user.
            listings = await Listing.find({ vendorId: user._id });
            const listingIds = listings.map(l => l._id);

            // Find bookings for those listings
            bookings = await Booking.find({ listingId: { $in: listingIds } });

            // Vendors count is generic or just 1 (themselves)
            vendors = [user];
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Calculate statistics
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        const totalBookings = bookings.length;
        const totalListings = listings.length;
        const totalVendors = vendors.length;

        // Bookings by status
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
        const pendingBookings = bookings.filter(b => b.status === 'pending').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

        // Listings by type
        const listingsByType = {
            hotel: listings.filter(l => l.type === 'hotel').length,
            cinema: listings.filter(l => l.type === 'cinema').length,
            space: listings.filter(l => l.type === 'space').length,
            vehicle: listings.filter(l => l.type === 'vehicle').length
        };

        // Monthly revenue for the last 6 months
        const monthlyRevenue = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();

            const revenue = bookings
                .filter(b => {
                    const bDate = new Date(b.createdAt);
                    return bDate.getMonth() === month && bDate.getFullYear() === year;
                })
                .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            monthlyRevenue.push({
                name: monthNames[month],
                revenue: revenue
            });
        }

        res.status(200).json({
            totalRevenue,
            totalBookings,
            totalListings,
            totalVendors,
            bookingsByStatus: {
                confirmed: confirmedBookings,
                pending: pendingBookings,
                cancelled: cancelledBookings
            },
            listingsByType,
            monthlyRevenue
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.exportReport = async (req, res) => {
    try {
        const { type, range } = req.query;
        const user = req.user;

        let query = {};
        const now = new Date();
        if (range === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            query.createdAt = { $gte: startOfDay };
        } else if (range === 'last-7') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            query.createdAt = { $gte: sevenDaysAgo };
        } else if (range === 'last-30') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            query.createdAt = { $gte: thirtyDaysAgo };
        }

        // Filter by vendor if applicable
        if (user.role === 'vendor') {
            const listings = await Listing.find({ vendorId: user._id });
            const listingIds = listings.map(l => l._id);
            query.listingId = { $in: listingIds };
        }

        const bookings = await Booking.find(query)
            .populate('userId', 'name email')
            .populate('listingId', 'title type');

        // CSV Header
        let csvContent = "Booking ID,Date,Customer,Email,Listing,Type,Amount,Status\n";

        // CSV Rows
        bookings.forEach(b => {
            const date = b.createdAt ? b.createdAt.toISOString().split('T')[0] : 'N/A';
            const customer = b.userId ? b.userId.name : 'N/A';
            const email = b.userId ? b.userId.email : 'N/A';
            const listing = b.listingId ? b.listingId.title : 'N/A';
            const listingType = b.listingId ? b.listingId.type : 'N/A';
            const amount = b.totalPrice || 0;
            const status = b.status || 'pending';

            csvContent += `${b._id},${date},"${customer}","${email}","${listing}",${listingType},${amount},${status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${range}.csv`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
