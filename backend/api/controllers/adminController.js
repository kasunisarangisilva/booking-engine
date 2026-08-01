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
      let bookings, listings, vendors;

      if (user.role === "admin") {
        bookings = await Booking.find();
        listings = await Listing.find();
        vendors = await User.find({ role: "vendor" });
      } else if (user.role === "vendor") {
        listings = await Listing.find({ vendorId: user._id });
        const listingIds = listings.map((l) => l._id);
        bookings = await Booking.find({ listingId: { $in: listingIds } });
        vendors = [user];
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      const totalRevenue = bookings.reduce(
        (sum, booking) => sum + (booking.totalPrice || 0),
        0,
      );
      const totalBookings = bookings.length;
      const totalListings = listings.length;
      const totalVendors = vendors.length;

      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed",
      ).length;
      const pendingBookings = bookings.filter(
        (b) => b.status === "pending",
      ).length;
      const cancelledBookings = bookings.filter(
        (b) => b.status === "cancelled",
      ).length;

      const listingsByType = {
        hotel: listings.filter((l) => l.type === "hotel").length,
        cinema: listings.filter((l) => l.type === "cinema").length,
        space: listings.filter((l) => l.type === "space").length,
        vehicle: listings.filter((l) => l.type === "vehicle").length,
      };

      const monthlyRevenue = [];
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();

        const revenue = bookings
          .filter((b) => {
            const bDate = new Date(b.createdAt);
            return bDate.getMonth() === month && bDate.getFullYear() === year;
          })
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        monthlyRevenue.push({
          name: monthNames[month],
          revenue: revenue,
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
          cancelled: cancelledBookings,
        },
        listingsByType,
        monthlyRevenue,
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

      let query = {};
      const now = new Date();
      if (range === "today") {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        query.createdAt = { $gte: startOfDay };
      } else if (range === "last-7") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        query.createdAt = { $gte: sevenDaysAgo };
      } else if (range === "last-30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        query.createdAt = { $gte: thirtyDaysAgo };
      }

      if (user.role === "vendor") {
        const listings = await Listing.find({ vendorId: user._id });
        const listingIds = listings.map((l) => l._id);
        query.listingId = { $in: listingIds };
      }

      const bookings = await Booking.find(query)
        .populate("userId", "name email")
        .populate("listingId", "title type");

      if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${range}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text('Bookings Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date Range: ${range}`, { align: 'center' });
        doc.moveDown(2);

        // Simple table implementation for PDF
        const tableTop = doc.y;
        const itemY = tableTop;

        doc.font('Helvetica-Bold');
        doc.text('Date', 50, itemY, { width: 90 });
        doc.text('Customer', 150, itemY, { width: 150 });
        doc.text('Listing', 300, itemY, { width: 150 });
        doc.text('Amount', 460, itemY, { width: 70 });
        doc.text('Status', 530, itemY, { width: 60 });

        doc.moveTo(50, itemY + 15).lineTo(590, itemY + 15).stroke();
        
        let y = itemY + 20;
        doc.font('Helvetica');

        bookings.forEach(b => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          const date = b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A";
          const customer = (b.userId && b.userId.name) ? String(b.userId.name) : "N/A";
          const listing = (b.listingId && b.listingId.title) ? String(b.listingId.title) : "N/A";
          const amount = `$${(b.totalPrice || 0).toFixed(2)}`;
          const status = String(b.status || "pending");

          doc.text(date, 50, y, { width: 90 });
          doc.text(customer, 150, y, { width: 150 });
          doc.text(listing, 300, y, { width: 150 });
          doc.text(amount, 460, y, { width: 70 });
          doc.text(status, 530, y, { width: 60 });
          y += 20;
        });

        doc.end();
      } else {
        let csvContent = "Booking ID,Date,Customer,Email,Listing,Type,Amount,Status\n";

        bookings.forEach((b) => {
          const date = b.createdAt ? b.createdAt.toISOString().split("T")[0] : "N/A";
          const customer = (b.userId && b.userId.name) ? String(b.userId.name) : "N/A";
          const email = (b.userId && b.userId.email) ? String(b.userId.email) : "N/A";
          const listing = (b.listingId && b.listingId.title) ? String(b.listingId.title) : "N/A";
          const listingType = (b.listingId && b.listingId.type) ? String(b.listingId.type) : "N/A";
          const amount = b.totalPrice || 0;
          const status = String(b.status || "pending");
          csvContent += `${b._id},${date},"${customer}","${email}","${listing}",${listingType},${amount},${status}\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=bookings-report-${range}.csv`);
        res.status(200).send(csvContent);
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
