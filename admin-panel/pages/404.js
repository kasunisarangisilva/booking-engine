import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

export default function Custom404() {
    return (
        <AdminLayout>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '8rem',
                    fontWeight: '900',
                    margin: '0',
                    color: 'var(--primary)',
                    letterSpacing: '-0.05em'
                }}>
                    404
                </h1>
                <div style={{
                    width: '60px',
                    height: '4px',
                    background: 'var(--accent)',
                    margin: '1.5rem 0',
                    borderRadius: '2px'
                }}></div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Lost in the Cloud?
                </h2>
                <p style={{ color: 'var(--secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
                    The page you are looking for doesn't exist or has been moved.
                    Let's get you back to the command center.
                </p>
                <Link href="/" className="btn btn-accent" style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'inline-block'
                }}>
                    Back to Dashboard
                </Link>
            </div>
        </AdminLayout>
    );
}


// පියවර 1: Backend Model (Database) එක වෙනස් කිරීම
// File: 

// Booking.js
// කරන දේ: Schema එකේ ඇති අදාළ field එක comment කර හෝ Delete කර දමන්න.
// javascript
// backend/database/models/Booking.js
// const bookingSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
// phone: { type: String, trim: true },  <-- මේ line එක Comment හෝ Delete කරන්න
//     totalPrice: { type: Number, required: true }
// });

// පියවර 2: Frontend UI එකෙන් Column එක අයින් කිරීම
// File: 

// admin-panel/pages/bookings/index.js
// කරන දේ:
// Table Header (<th>) එකෙන් අදාළ Label එක අයින් කරන්න.
// Table Body (<td>) එකෙන් අදාළ Value එක Display වන කොටස අයින් කරන්න.
// jsx
// // 1. Table Header (<th>) අයින් කිරීම
// <thead>
//   <tr>
//     <th>Booking ID</th>
//     <th>Customer</th>
{/* <th>Phone Number</th> <-- මේ <th> එක remove කරන්න */ }
//     <th>Total Price</th>
//     <th>Status</th>
//   </tr>
// </thead>

// 2. Table Data (<td>) අයින් කිරීම
{/* <tbody>
  {bookings.map(booking => (
    <tr key={booking._id}>
      <td>{booking._id}</td>
      <td>{booking.userId?.name}</td> */}
{/* <td>{booking.phone}</td> <-- මේ <td> එක remove කරන්න */ }
//       <td>${booking.totalPrice}</td>
//       <td>{booking.status}</td>
//     </tr>
//   ))}
// </tbody>
// Scenario 2: Table Column එකක් & Action Buttons එක Page එකකින් අයින් කරලා වෙනත් Page එකකට දෑමීම
// උදාහරණයකට Examiner කිව්වොත්: "Bookings Table එකේ තියෙන Actions Column එක (View, Edit, Cancel Buttons) මේ Main Table එකෙන් අයින් කරලා Booking Details Modal/Page එක ඇතුලට විතරක් දාන්න" කියලා.

// පියවර 1: Main Table Page එකෙන් Header එක සහ Buttons අයින් කිරීම
// File: 

// admin-panel/pages/bookings/index.js
// jsx
// 1. Table Header (<th>) එකෙන් "Actions" column header එක Remove කිරීම
{/* <th>Status</th> */ }
{/* <th>Actions</th>  <-- Delete or Comment */ }
// 2. Table Row (<td>) එකෙන් Buttons ටික Remove කිරීම
{/* <td>{booking.status}</td> */ }
{/* <td>
    <button onClick={() => handleView(booking._id)}><Eye /></button>
    <button onClick={() => handleCancel(booking._id)}><XCircle /></button>
    <button onClick={() => handleDelete(booking._id)}><Trash2 /></button>
</td> */}
// පියවර 2: අදාළ Buttons වෙනත් Page එකකට / Modal එකකට Move කිරීම
// File: උදාහරණයකට 

// admin-panel/pages/bookings/[id].js
//  (හෝ Details View Modal එක)
// කරන දේ: Main page එකෙන් කපපු Buttons ටික අලුත් Page එකේ Header එකට හෝ Footer එකට Paste කර අදාළ Functions (handleCancel, handleDelete) සහ Icons (lucide-react වලින් Trash2, XCircle) Import කර ගැනීම.
// jsx
// Destination Page / Modal එකේ Top Header හෝ Card Footer එකට දාන්න:
{/* <div className="flex gap-2 justify-end mt-4">
    <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-1">
        <XCircle size={16} /> Cancel Booking
    </button>
    <button onClick={handleDelete} className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-1">
        <Trash2 size={16} /> Delete Record
    </button>
</div>
Scenario 3: Code වෙනස් කරපු හැටි Examiner ට Explain කරන්නේ කොහොමද? (Code Explanation)
Code එක වෙනස් කරලා ඉවර වෙලා Examiner ට මෙහෙම පැහැදිලි කරන්න:

English වලින්: "I have updated the system according to your requirement in two simple steps:

First, in the Backend Mongoose Schema (Booking.js), I removed the specific field definition so that it's no longer persisted in MongoDB.
Second, in the Frontend (bookings/index.js), I removed the corresponding <th> table header and <td> data cell. I then relocated the Action Buttons into the individual View Page/Modal so that the main table layout remains clean and uncluttered."
Sinhala වලින් (Examiner සිංහලෙන් ඇහුවොත්): "මම step දෙකකින් මේක කළා. පළමුව Backend එකේ Booking.js Mongoose Schema එකෙන් ඒ field එක remove කළා. ඊටපස්සේ Frontend එකේ Table Header (<th>) එකෙනුයි, Table Row (<td>) එකෙනුයි ඒ column එක සහ Action Buttons ටික අයින් කරලා, Booking Details view එක ඇතුලට ඒ buttons ටික shift කළා."


Examiner Feedback: "Thank you, that's a great suggestion. I will incorporate it right away." කියා සිනාමුසු මුහුණින් පිළිගන්න. */}