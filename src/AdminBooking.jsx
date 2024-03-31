import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const AdminBooking = () => {
  const [currentBookings, setCurrentBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [manageBooking, setManageBooking] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:3001/get-pending-bookings', { withCredentials: true });
      setCurrentBookings(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const response = await axios.get(`http://localhost:3001/get-booking-details/${bookingId}`, { withCredentials: true });
      if (response.status === 200) {
        setSelectedBooking(response.data.bookingDetails || []);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const handleManageBooking = (booking) => {
    setManageBooking(booking);
    setStatus(booking.status);
    setRemarks(booking.remarks || '');
    setRoom(booking.room || '');
  };

  const handleUpdateBooking = async () => {
    try {
      const response = await axios.put(`http://localhost:3001/update-booking/${manageBooking.bid}`, {
        status,
        remarks,
        room,
      }, { withCredentials: true });

      if (response.status === 200) {
        alert('Booking updated successfully');
        setManageBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const BookingModal = ({ bookingDetails, onClose }) => {
    if (!bookingDetails || bookingDetails.length === 0) return null;
  
    // Initialize currentPage state within the modal
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = bookingDetails.length;
    const currentBookingDetail = bookingDetails[currentPage];
  
    const handlePrevious = () => {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };
  
    const handleNext = () => {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
    };
  
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h2>Booking Details (ID: {currentBookingDetail.bid})</h2>
          <table className="modal-table">
            <tbody>
              <tr>
                <th>Guest Name:</th>
                <td>{currentBookingDetail.guestname}</td>
              </tr>
              <tr>
                <th>Phone:</th>
                <td>{currentBookingDetail.phone}</td>
              </tr>
              <tr>
                <th>Email:</th>
                <td>{currentBookingDetail.email}</td>
              </tr>
              <tr>
                <th>Visitor ID:</th>
                <td>{currentBookingDetail.visitoridcard}</td>
              </tr>
              <tr>
                <th>Address:</th>
                <td>{currentBookingDetail.address}</td>
              </tr>
              <tr>
                <th>Relationship with User:</th>
                <td>{currentBookingDetail.relationshipwithuser}</td>
              </tr>
              {/* Add more details as needed */}
            </tbody>
          </table>
          <div className="modal-navigation">
            {currentPage > 0 && <button onClick={handlePrevious} className="modal-nav-button">Previous</button>}
            {currentPage < totalPages - 1 && <button onClick={handleNext} className="modal-nav-button">Next</button>}
          </div>
          <button onClick={onClose} className="close-modal-button">Close</button>
        </div>
      </div>
    );
  };

  const ManageBookingModal = () => {
    if (!manageBooking) return null;
  
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h2>Manage Booking (ID: {manageBooking.bid})</h2>
          <div className="form-group">
            <label>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label>Remarks:</label>
            <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Room:</label>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} />
          </div>
          <button onClick={handleUpdateBooking}>Update Booking</button>
          <button onClick={() => setManageBooking(null)}>Close</button>
        </div>
      </div>
    );
  };

  const renderTable = (bookings) => (
    <>
      <h2>Current Bookings</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.bid}>
              <td>{booking.bid}</td>
              <td>{formatDate(booking.startdate)}</td>
              <td>{formatDate(booking.enddate)}</td>
              <td>{booking.status}</td>
              <td>
                <button onClick={() => handleViewDetails(booking.bid)}>View Details</button>
                <button onClick={() => handleManageBooking(booking)}>Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="admin-booking">
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">Booking System</div>
        <ul className="dashboard-items">
          <li><Link to="/dashboard">Home</Link></li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>
      {renderTable(currentBookings)}
      {selectedBooking && <BookingModal bookingDetails={selectedBooking} onClose={() => setSelectedBooking(null)} />}
      {manageBooking && <ManageBookingModal />}
    </div>
  );
};

export default AdminBooking;
