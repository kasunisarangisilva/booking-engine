# Multi-Vendor Booking Engine

A complete multi-vendor booking ecosystem with Backend, Booking Frontend, and Admin Panel.

## 🚀 Running the Projects

I recommend opening three separate terminals in the project root:

### 1. Backend API (Port 5000)
```bash
cd backend
npm start
```
*Wait for: "Server running on port 5000"*

### 2. Booking Frontend (Port 3000)
```bash
cd booking-frontend
npm run dev
```
*Access at: [http://localhost:3000](http://localhost:3000)*

### 3. Admin Panel (Port 3001)
```bash
cd admin-panel
npm run dev
```
*Access at: [http://localhost:3001](http://localhost:3001)*

---

## 🛠 Features
- **Backend**: Express API with JWT Auth, Polymorphic Listings (Hotel, Cinema, Space, Vehicle).
- **Booking Frontend**: Search, View Details, and Book.
- **Admin Panel**: Dashboard stats, Vendor Approval, and Listing Management.

## 📝 Demo Credentials
You can register new users in the apps, but here is a sample flow:
1. **Register** as a Vendor in the Admin Panel / Signup.
2. **Add a Listing** in the Admin Panel.
3. **Approve** from Admin view (or it's auto-available in this demo).
4. **Browse & Book** in the Booking Frontend.
5. **Check Bookings** in the User and Admin dashboards.
