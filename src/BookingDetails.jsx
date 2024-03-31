import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BookingDetailsPage = () => {
  const [currentBookings, setCurrentBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 1; // Show one booking detail per page

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:3001/get-booking-details', {
          withCredentials: true,
        });
        if (response.status === 200) {
          const current = response.data.filter(booking => booking.status !== 'accepted' && booking.status !== 'rejected');
          const history = response.data.filter(booking => booking.status === 'accepted' || booking.status === 'rejected');
          setCurrentBookings(current);
          setBookingHistory(history);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };

    fetchBookings();
  }, []);
  
  const handleViewDetails = async (bookingId) => {
    try {
      const response = await axios.get(`http://localhost:3001/get-booking-details/${bookingId}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setSelectedBooking(Array.isArray(response.data.bookingDetails) ? response.data.bookingDetails : [response.data.bookingDetails]);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
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
              {/* Dynamically render booking detail rows */}
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
                <th>Visitor ID: </th>
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
              <tr>
                <th>Preferred GuestHouse: </th>
                <td>{currentBookingDetail.currentpreferredGuesthouse || 'Not specified'}</td>
              </tr>
              <tr>
                <th>Preferred Room: </th>
                <td>{currentBookingDetail.currentpreferredRoom || 'Not specified'}</td>
              </tr>
              <tr>
                <th>Arrival Date and Time:</th>
                <td>{new Date(currentBookingDetail.timeofarrival).toLocaleString()}</td>
              </tr>
              <tr>
                <th>Departure Date and Time:</th>
                <td>{new Date(currentBookingDetail.timeofdeparture).toLocaleString()}</td>
              </tr>
              <tr>
                <th>Purpose of Visit: </th>
                <td>{currentBookingDetail.purposeofvisit}</td>
              </tr>
            </tbody>
          </table>
  
          <div className="modal-navigation">
            {currentPage > 0 && (
              <button onClick={handlePrevious} className="modal-nav-button">Previous</button>
            )}
            {currentPage < totalPages - 1 && (
              <button onClick={handleNext} className="modal-nav-button">Next</button>
            )}
          </div>
  
          <button onClick={onClose} className="close-modal-button">Close</button>
        </div>
      </div>
    );
  };
  
  
  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  const renderTable = (bookings, title) => (
    <>
      <h2>{title}</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Final Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.bid}>
              <td>{booking.bid}</td>
              <td>{formatDate(booking.startdate)}</td>
              <td>{formatDate(booking.enddate)}</td>
              <td>{booking.status}</td>
              <td>{booking.finalprice || "Not confirmed"}</td>
              <td>
                <button onClick={() => handleViewDetails(booking.bid)} className="dashboard-button">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div>
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">Booking System</div>
        <ul className="dashboard-items">
          <li><Link to="/dashboard" className="dashboard-link">Home</Link></li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>
      <BookingModal bookingDetails={selectedBooking} onClose={handleCloseModal} />
      {currentBookings.length > 0 && renderTable(currentBookings, 'Current Bookings')}
      {bookingHistory.length > 0 && renderTable(bookingHistory, 'Booking History')}
    </div>
  );
};

export default BookingDetailsPage;
