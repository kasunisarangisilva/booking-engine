const User = require("../../database/models/User");
const Booking = require("../../database/models/Booking");
const { Listing } = require("../../database/models/Listing");
const AdminService = require("../../services/AdminService");
const adminService = new AdminService();
const Notification = require("../../database/models/Notification");
const PDFDocument = require("pdfkit");
const PlatformSettings = require("../../database/models/PlatformSettings");

const AdminController = {
  async getAllVendorsV2(req, res, next) {
    const { page, limit, sort } = req.query;
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;

      const vendors = await adminService.getAllVendorsV2({
        page: parsedPage,
        limit: parsedLimit,
        sort: sort,
      });

      return res.status(200).json({
        success: vendors.success,
        message: vendors.message,
        data: vendors.data,
      });
    } catch (error) {
      console.error("Get all vendors error:", error);
      next(error);
    }
  },

  async getAllVendors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalVendors = await User.countDocuments({ role: "vendor" });
      const vendors = await User.find({ role: "vendor" })
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.status(200).json({
        vendors,
        pagination: {
          total: totalVendors,
          page,
          limit,
          totalPages: Math.ceil(totalVendors / limit),
        },
      });
    } catch (error) {
      console.error("Get all vendors error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async approveVendor(req, res) {
    try {
      const { vendorId } = req.body;

      const vendor = await User.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      if (vendor.role !== "vendor") {
        return res.status(400).json({ message: "User is not a vendor" });
      }

      vendor.status = "active";
      await vendor.save();

      const notif = new Notification({
        recipient: vendor._id.toString(),
        type: 'vendor_approved',
        message: 'Your vendor account has been approved by an admin.'
      });
      await notif.save();
      if (req.io) {
        req.io.to(`vendor_${vendor._id}`).emit('notification', notif.toObject());
      }

      res.status(200).json({
        message: "Vendor approved successfully",
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          role: vendor.role,
          status: vendor.status,
        },
      });
    } catch (error) {
      console.error("Approve vendor error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async suspendVendor(req, res) {
    try {
      const { vendorId } = req.body;
      const vendor = await User.findById(vendorId);

      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      vendor.status = "suspended";
      await vendor.save();

      const notif = new Notification({
        recipient: vendor._id.toString(),
        type: 'vendor_suspended',
        message: 'Your vendor account has been suspended by an admin.'
      });
      await notif.save();
      if (req.io) {
        req.io.to(`vendor_${vendor._id}`).emit('notification', notif.toObject());
      }

      res.status(200).json({ message: "Vendor suspended successfully" });
    } catch (error) {
      console.error("Suspend vendor error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async activateVendor(req, res) {
    try {
      const { vendorId } = req.body;
      const vendor = await User.findById(vendorId);

      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      vendor.status = "active";
      await vendor.save();

      const notif = new Notification({
        recipient: vendor._id.toString(),
        type: 'vendor_activated',
        message: 'Your vendor account has been activated by an admin.'
      });
      await notif.save();
      if (req.io) {
        req.io.to(`vendor_${vendor._id}`).emit('notification', notif.toObject());
      }

      res.status(200).json({ message: "Vendor activated successfully" });
    } catch (error) {
      console.error("Activate vendor error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async inactivateVendor(req, res) {
    try {
      const { vendorId } = req.body;
      const vendor = await User.findById(vendorId);

      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      vendor.status = "inactive";
      await vendor.save();

      const notif = new Notification({
        recipient: vendor._id.toString(),
        type: 'vendor_inactive',
        message: 'Your vendor account has been marked as inactive.'
      });
      await notif.save();
      if (req.io) {
        req.io.to(`vendor_${vendor._id}`).emit('notification', notif.toObject());
      }

      res.status(200).json({ message: "Vendor marked as inactive successfully" });
    } catch (error) {
      console.error("Inactivate vendor error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getReports(req, res) {
    try {
      const user = req.user;
      const { type, range } = req.query;

      let effectiveType = type;
      if (user.role === 'admin') {
        if (!['vendors', 'listings'].includes(type)) {
          effectiveType = 'vendors';
        }
      } else if (user.role === 'vendor') {
        if (!['bookings', 'listings', 'customers'].includes(type)) {
          effectiveType = 'bookings';
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      const dateQuery = {};
      const now = new Date();
      if (range === "today") {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateQuery.createdAt = { $gte: startOfDay };
      } else if (range === "last-7") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        dateQuery.createdAt = { $gte: d };
      } else if (range === "last-30") {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        dateQuery.createdAt = { $gte: d };
      } else if (range === "last-90") {
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        dateQuery.createdAt = { $gte: d };
      }

      let allBookings = [];
      let allListings = [];
      let allVendors = [];

      if (user.role === "admin") {
        allBookings = await Booking.find();
        allListings = await Listing.find();
        allVendors = await User.find({ role: "vendor" });
      } else {
        allListings = await Listing.find({ vendorId: user._id });
        const listingIds = allListings.map((l) => l._id);
        allBookings = await Booking.find({ listingId: { $in: listingIds } });
        allVendors = [user];
      }

      const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const totalBookings = allBookings.length;
      const totalListings = allListings.length;
      const totalVendors = allVendors.length;

      let previewItems = [];

      if (effectiveType === 'vendors') {
        const vendorsList = await User.find({ role: "vendor", ...dateQuery }).sort({ createdAt: -1 });
        previewItems = vendorsList.map(v => ({
          id: v._id,
          date: v.createdAt ? v.createdAt.toISOString().split("T")[0] : "N/A",
          description: `${v.name || 'Vendor'} (${v.email || 'No Email'})`,
          amount: 0,
          status: v.status || 'active'
        }));
      } else if (effectiveType === 'listings') {
        const lQuery = user.role === 'vendor' ? { vendorId: user._id, ...dateQuery } : { ...dateQuery };
        const listingsList = await Listing.find(lQuery).populate('vendorId', 'name email').sort({ createdAt: -1 });
        previewItems = listingsList.map(l => ({
          id: l._id,
          date: l.createdAt ? l.createdAt.toISOString().split("T")[0] : "N/A",
          description: `${l.title || 'Untitled'} [${(l.type || 'listing').toUpperCase()}]${user.role === 'admin' && l.vendorId?.name ? ` - ${l.vendorId.name}` : ''}`,
          amount: l.price || 0,
          status: l.status || 'active'
        }));
      } else if (effectiveType === 'bookings') {
        const lIds = allListings.map((l) => l._id);
        const bQuery = { listingId: { $in: lIds }, ...dateQuery };
        const bookingsList = await Booking.find(bQuery).populate('userId', 'name email').populate('listingId', 'title type').sort({ createdAt: -1 });
        previewItems = bookingsList.map(b => ({
          id: b._id,
          date: b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A",
          description: `${b.listingId?.title || 'Listing'} - Customer: ${b.userId?.name || 'Guest'}`,
          amount: b.totalPrice || 0,
          status: b.status || 'pending'
        }));
      } else if (effectiveType === 'customers' && user.role === 'vendor') {
        const lIds = allListings.map((l) => l._id);
        const bQuery = { listingId: { $in: lIds }, ...dateQuery };
        const bookingsList = await Booking.find(bQuery).populate('userId', 'name email createdAt').sort({ createdAt: -1 });

        const customerMap = {};
        bookingsList.forEach(b => {
          if (b.userId && b.userId._id) {
            const cid = b.userId._id.toString();
            if (!customerMap[cid]) {
              customerMap[cid] = {
                id: b.userId._id,
                name: b.userId.name || 'Guest',
                email: b.userId.email || 'N/A',
                lastDate: b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A",
                bookingCount: 0,
                totalSpent: 0
              };
            }
            customerMap[cid].bookingCount += 1;
            customerMap[cid].totalSpent += (b.totalPrice || 0);
          }
        });

        previewItems = Object.values(customerMap).map(c => {
          const rawEmail = c.email || '';
          const isInternalGuest = rawEmail.includes('@guest.internal') || rawEmail.startsWith('widget_');
          const emailDisplay = (rawEmail && !isInternalGuest) ? ` (${rawEmail})` : '';
          const countText = c.bookingCount === 1 ? '1 booking' : `${c.bookingCount} bookings`;
          return {
            id: c.id,
            date: c.lastDate,
            description: `${c.name}${emailDisplay} - ${countText}`,
            amount: c.totalSpent,
            status: 'active'
          };
        });
      }

      res.status(200).json({
        userRole: user.role,
        totalRevenue,
        totalBookings,
        totalListings,
        totalVendors,
        previewItems
      });
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async exportReport(req, res) {
    try {
      const { type, range, format } = req.query;
      const user = req.user;

      let effectiveType = type;
      if (user.role === 'admin') {
        if (!['vendors', 'listings'].includes(type)) {
          effectiveType = 'vendors';
        }
      } else if (user.role === 'vendor') {
        if (!['bookings', 'listings', 'customers'].includes(type)) {
          effectiveType = 'bookings';
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      const dateQuery = {};
      const now = new Date();
      if (range === "today") {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        dateQuery.createdAt = { $gte: startOfDay };
      } else if (range === "last-7") {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        dateQuery.createdAt = { $gte: d };
      } else if (range === "last-30") {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        dateQuery.createdAt = { $gte: d };
      } else if (range === "last-90") {
        const d = new Date(now);
        d.setDate(d.getDate() - 90);
        dateQuery.createdAt = { $gte: d };
      }

      if (effectiveType === 'vendors') {
        const vendors = await User.find({ role: "vendor", ...dateQuery }).sort({ createdAt: -1 });

        if (format === 'pdf') {
          const doc = new PDFDocument({ margin: 30 });
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=vendors-report-${range || 'all'}.pdf`);
          doc.pipe(res);

          doc.fontSize(20).text('Vendor Accounts Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Date Range: ${range || 'All Time'}`, { align: 'center' });
          doc.moveDown(2);

          const itemY = doc.y;
          doc.font('Helvetica-Bold');
          doc.text('Joined Date', 50, itemY, { width: 100 });
          doc.text('Vendor Name', 160, itemY, { width: 150 });
          doc.text('Email', 320, itemY, { width: 180 });
          doc.text('Status', 510, itemY, { width: 80 });

          doc.moveTo(50, itemY + 15).lineTo(580, itemY + 15).stroke();

          let y = itemY + 20;
          doc.font('Helvetica');
          vendors.forEach(v => {
            if (y > 700) { doc.addPage(); y = 50; }
            const date = v.createdAt ? v.createdAt.toISOString().split("T")[0] : "N/A";
            doc.text(date, 50, y, { width: 100 });
            doc.text(v.name || "N/A", 160, y, { width: 150 });
            doc.text(v.email || "N/A", 320, y, { width: 180 });
            doc.text(v.status || "active", 510, y, { width: 80 });
            y += 20;
          });
          doc.end();
        } else {
          let csvContent = "Vendor ID,Date Joined,Name,Email,Status\n";
          vendors.forEach(v => {
            const date = v.createdAt ? v.createdAt.toISOString().split("T")[0] : "N/A";
            csvContent += `${v._id},${date},"${v.name || ''}","${v.email || ''}",${v.status || 'active'}\n`;
          });
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename=vendors-report-${range || 'all'}.csv`);
          res.status(200).send(csvContent);
        }
      } else if (effectiveType === 'listings') {
        const lQuery = user.role === 'vendor' ? { vendorId: user._id, ...dateQuery } : { ...dateQuery };
        const listings = await Listing.find(lQuery).populate('vendorId', 'name email').sort({ createdAt: -1 });

        if (format === 'pdf') {
          const doc = new PDFDocument({ margin: 30 });
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=listings-report-${range || 'all'}.pdf`);
          doc.pipe(res);

          doc.fontSize(20).text('Listings Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Date Range: ${range || 'All Time'}`, { align: 'center' });
          doc.moveDown(2);

          const itemY = doc.y;
          doc.font('Helvetica-Bold');
          doc.text('Date', 50, itemY, { width: 80 });
          doc.text('Title', 140, itemY, { width: 160 });
          doc.text('Type', 310, itemY, { width: 70 });
          doc.text('Vendor', 390, itemY, { width: 110 });
          doc.text('Price', 510, itemY, { width: 70 });

          doc.moveTo(50, itemY + 15).lineTo(580, itemY + 15).stroke();

          let y = itemY + 20;
          doc.font('Helvetica');
          listings.forEach(l => {
            if (y > 700) { doc.addPage(); y = 50; }
            const date = l.createdAt ? l.createdAt.toISOString().split("T")[0] : "N/A";
            const vendorName = l.vendorId?.name || "N/A";
            const price = `$${(l.price || 0).toFixed(2)}`;
            doc.text(date, 50, y, { width: 80 });
            doc.text(l.title || "N/A", 140, y, { width: 160 });
            doc.text((l.type || "listing").toUpperCase(), 310, y, { width: 70 });
            doc.text(vendorName, 390, y, { width: 110 });
            doc.text(price, 510, y, { width: 70 });
            y += 20;
          });
          doc.end();
        } else {
          let csvContent = "Listing ID,Date Created,Title,Type,Vendor,Price,Status\n";
          listings.forEach(l => {
            const date = l.createdAt ? l.createdAt.toISOString().split("T")[0] : "N/A";
            const vendorName = l.vendorId?.name || "N/A";
            csvContent += `${l._id},${date},"${l.title || ''}",${l.type || ''},"${vendorName}",${l.price || 0},${l.status || 'active'}\n`;
          });
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename=listings-report-${range || 'all'}.csv`);
          res.status(200).send(csvContent);
        }
      } else if (effectiveType === 'bookings') {
        const myListings = await Listing.find({ vendorId: user._id });
        const listingIds = myListings.map((l) => l._id);
        const bQuery = { listingId: { $in: listingIds }, ...dateQuery };
        const bookings = await Booking.find(bQuery).populate('userId', 'name email').populate('listingId', 'title type').sort({ createdAt: -1 });

        if (format === 'pdf') {
          const doc = new PDFDocument({ margin: 30 });
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${range || 'all'}.pdf`);
          doc.pipe(res);

          doc.fontSize(20).text('Bookings Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Date Range: ${range || 'All Time'}`, { align: 'center' });
          doc.moveDown(2);

          const itemY = doc.y;
          doc.font('Helvetica-Bold');
          doc.text('Date', 50, itemY, { width: 80 });
          doc.text('Customer', 140, itemY, { width: 140 });
          doc.text('Listing', 290, itemY, { width: 150 });
          doc.text('Amount', 450, itemY, { width: 70 });
          doc.text('Status', 530, itemY, { width: 60 });

          doc.moveTo(50, itemY + 15).lineTo(590, itemY + 15).stroke();

          let y = itemY + 20;
          doc.font('Helvetica');
          bookings.forEach(b => {
            if (y > 700) { doc.addPage(); y = 50; }
            const date = b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A";
            const customer = (b.userId && b.userId.name) ? String(b.userId.name) : "Guest";
            const listing = (b.listingId && b.listingId.title) ? String(b.listingId.title) : "N/A";
            const amount = `$${(b.totalPrice || 0).toFixed(2)}`;
            const status = String(b.status || "pending");

            doc.text(date, 50, y, { width: 80 });
            doc.text(customer, 140, y, { width: 140 });
            doc.text(listing, 290, y, { width: 150 });
            doc.text(amount, 450, y, { width: 70 });
            doc.text(status, 530, y, { width: 60 });
            y += 20;
          });
          doc.end();
        } else {
          let csvContent = "Booking ID,Date,Customer,Email,Listing,Type,Amount,Status\n";
          bookings.forEach((b) => {
            const date = b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A";
            const customer = (b.userId && b.userId.name) ? String(b.userId.name) : "Guest";
            const email = (b.userId && b.userId.email) ? String(b.userId.email) : "N/A";
            const listing = (b.listingId && b.listingId.title) ? String(b.listingId.title) : "N/A";
            const listingType = (b.listingId && b.listingId.type) ? String(b.listingId.type) : "N/A";
            const amount = b.totalPrice || 0;
            const status = String(b.status || "pending");
            csvContent += `${b._id},${date},"${customer}","${email}","${listing}",${listingType},${amount},${status}\n`;
          });
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename=bookings-report-${range || 'all'}.csv`);
          res.status(200).send(csvContent);
        }
      } else if (effectiveType === 'customers' && user.role === 'vendor') {
        const myListings = await Listing.find({ vendorId: user._id });
        const listingIds = myListings.map((l) => l._id);
        const bQuery = { listingId: { $in: listingIds }, ...dateQuery };
        const bookings = await Booking.find(bQuery).populate('userId', 'name email').sort({ createdAt: -1 });

        const customerMap = {};
        bookings.forEach(b => {
          if (b.userId && b.userId._id) {
            const cid = b.userId._id.toString();
            if (!customerMap[cid]) {
              customerMap[cid] = {
                id: b.userId._id,
                name: b.userId.name || 'Guest',
                email: b.userId.email || 'N/A',
                lastDate: b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A",
                bookingCount: 0,
                totalSpent: 0
              };
            }
            customerMap[cid].bookingCount += 1;
            customerMap[cid].totalSpent += (b.totalPrice || 0);
          }
        });

        const customerList = Object.values(customerMap);

        if (format === 'pdf') {
          const doc = new PDFDocument({ margin: 30 });
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=customers-report-${range || 'all'}.pdf`);
          doc.pipe(res);

          doc.fontSize(20).text('Customer Accounts Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Date Range: ${range || 'All Time'}`, { align: 'center' });
          doc.moveDown(2);

          const itemY = doc.y;
          doc.font('Helvetica-Bold');
          doc.text('Last Booking', 50, itemY, { width: 90 });
          doc.text('Customer Name', 150, itemY, { width: 140 });
          doc.text('Email', 300, itemY, { width: 150 });
          doc.text('Bookings', 460, itemY, { width: 60 });
          doc.text('Total Spent', 530, itemY, { width: 70 });

          doc.moveTo(50, itemY + 15).lineTo(590, itemY + 15).stroke();

          let y = itemY + 20;
          doc.font('Helvetica');
          customerList.forEach(c => {
            if (y > 700) { doc.addPage(); y = 50; }
            const rawEmail = c.email || '';
            const isInternalGuest = rawEmail.includes('@guest.internal') || rawEmail.startsWith('widget_');
            const displayEmail = (rawEmail && !isInternalGuest) ? rawEmail : 'N/A';
            const amount = `$${c.totalSpent.toFixed(2)}`;
            doc.text(c.lastDate, 50, y, { width: 90 });
            doc.text(c.name, 150, y, { width: 140 });
            doc.text(displayEmail, 300, y, { width: 150 });
            doc.text(String(c.bookingCount), 460, y, { width: 60 });
            doc.text(amount, 530, y, { width: 70 });
            y += 20;
          });
          doc.end();
        } else {
          let csvContent = "Customer ID,Last Booking Date,Customer Name,Email,Total Bookings,Total Spent\n";
          customerList.forEach(c => {
            const rawEmail = c.email || '';
            const isInternalGuest = rawEmail.includes('@guest.internal') || rawEmail.startsWith('widget_');
            const displayEmail = (rawEmail && !isInternalGuest) ? rawEmail : 'N/A';
            csvContent += `${c.id},${c.lastDate},"${c.name}","${displayEmail}",${c.bookingCount},${c.totalSpent}\n`;
          });
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename=customers-report-${range || 'all'}.csv`);
          res.status(200).send(csvContent);
        }
      }
    } catch (error) {
      console.error("Export report error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getRecentActivities(req, res) {
    try {
      const user = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const fetchSize = page * limit;
      let activities = [];
      let totalActivities = 0;

      if (user.role === "admin") {
        const counts = await Promise.all([
          User.countDocuments({ role: "vendor" }),
          Listing.countDocuments(),
        ]);
        totalActivities = counts.reduce((a, b) => a + b, 0);

        const [recentVendors, recentListings] = await Promise.all([
          User.find({ role: "vendor" }).sort({ createdAt: -1 }).limit(fetchSize).select("name createdAt"),
          Listing.find().sort({ createdAt: -1 }).limit(fetchSize).populate("vendorId", "name"),
        ]);

        recentVendors.forEach((v) => {
          activities.push({ id: `vendor-${v._id}`, text: `New vendor "${v.name}" registered`, time: v.createdAt, icon: "👤", type: "vendor_registration", route: "/vendors" });
        });

        recentListings.forEach((l) => {
          const vendorName = l.vendorId?.name || "Unknown";
          activities.push({ id: `listing-${l._id}`, text: `New listing "${l.title}" created by ${vendorName}`, time: l.createdAt, icon: "🔔", type: "new_listing", route: "/listings" });
        });
      } else if (user.role === "vendor") {
        const allMyListings = await Listing.find({ vendorId: user._id }).select("_id");
        const listingIds = allMyListings.map((l) => l._id);

        const counts = await Promise.all([
          Listing.countDocuments({ vendorId: user._id }),
          Booking.countDocuments({ listingId: { $in: listingIds } }),
        ]);
        totalActivities = counts.reduce((a, b) => a + b, 0);

        const [myListings, myBookings] = await Promise.all([
          Listing.find({ vendorId: user._id }).sort({ createdAt: -1 }).limit(fetchSize),
          Booking.find({ listingId: { $in: listingIds } }).sort({ createdAt: -1 }).limit(fetchSize).populate("userId", "name").populate("listingId", "title"),
        ]);

        myBookings.forEach((b) => {
          const customerName = b.userId?.name || "Unknown";
          const listingTitle = b.listingId?.title || "Unknown";
          const statusText = b.status === "confirmed" ? "completed" : b.status;
          activities.push({ id: `booking-${b._id}`, text: `Booking for "${listingTitle}" ${statusText} by ${customerName}`, time: b.createdAt, icon: b.status === "confirmed" ? "✅" : b.status === "cancelled" ? "❌" : "📅", type: "booking", route: "/bookings" });
        });

        myListings.forEach((l) => {
          activities.push({ id: `listing-${l._id}`, text: `Your listing "${l.title}" was created`, time: l.createdAt, icon: "🔔", type: "new_listing", route: "/listings" });
        });
      }

      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      const startIndex = (page - 1) * limit;
      const pagedActivities = activities.slice(startIndex, startIndex + limit);

      res.status(200).json({
        activities: pagedActivities,
        pagination: { total: totalActivities, page, limit, totalPages: Math.ceil(totalActivities / limit) },
      });
    } catch (error) {
      console.error("Get recent activities error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Platform Settings
  async getSettings(req, res) {
    try {
      let settings = await PlatformSettings.findById('platform_settings');
      if (!settings) {
        // Create default settings if none exist
        settings = await PlatformSettings.create({ _id: 'platform_settings' });
      }
      res.json({ success: true, settings });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateSettings(req, res) {
    try {
      const {
        platformName,
        supportEmail,
        defaultCurrency,
        commissionRate,
        allowNewVendors,
        requireVendorApproval,
        maintenanceMode,
      } = req.body;

      const settings = await PlatformSettings.findByIdAndUpdate(
        'platform_settings',
        {
          $set: {
            platformName,
            supportEmail,
            defaultCurrency,
            commissionRate,
            allowNewVendors,
            requireVendorApproval,
            maintenanceMode,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.json({ success: true, settings, message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = AdminController;
