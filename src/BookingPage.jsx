import React, { useState } from 'react';
import './Dashboard.css'; // Ensure you have a CSS file named Dashboard.css with appropriate styles
import axios from 'axios';

const BookingPage = () => {
    const [bookingDetails, setBookingDetails] = useState({
        guestDetails: [{
          guestName: '',
          phone: '',
          address: '',
          email: '',
          visitorIdCard: '',
          relationshipWithUser: '',
        }],
        preferredOccupancy: '',
        timeOfDeparture: '',
        timeOfArrival: '',
        purposeOfVisit: '',
      });

      const handleChange = (e, index = null) => {
        const { name, value } = e.target;
    
        if (index !== null) { // For guestDetails array
          let guests = [...bookingDetails.guestDetails];
          guests[index] = { ...guests[index], [name]: value };
          setBookingDetails(prev => ({ ...prev, guestDetails: guests }));
        } else { // For other form fields
          setBookingDetails(prev => ({ ...prev, [name]: value }));
        }
      };

    const handleAddGuest = () => {
    const guestDetails = [...bookingDetails.guestDetails, { guestName: '', phone: '', visitorIdCard: '', relationshipWithUser: '' }];
    setBookingDetails({ ...bookingDetails, guestDetails });
    };

    const handleRemoveGuest = (index) => {
    const guestDetails = [...bookingDetails.guestDetails];
    guestDetails.splice(index, 1);
    setBookingDetails({ ...bookingDetails, guestDetails });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form behavior
    
        // Adjust the structure if necessary
        const submissionData = {
            ...bookingDetails,
            startDate: bookingDetails.timeOfDeparture,
            endDate: bookingDetails.timeOfArrival,
        };
        // Remove the original timeOfDeparture and timeOfArrival if needed
        delete submissionData.timeOfDeparture;
        delete submissionData.timeOfArrival;
    
        console.log('Submitting booking details:', submissionData);
    
        try {
            const response = await axios.post('http://localhost:3001/apply-booking', submissionData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 200) {
                console.log('Booking successful:', response.data);
                alert('Booking application successful!');
                // Consider redirecting the user or clearing the form here
            } else {
                console.error('Booking failed:', response.data.message);
                alert(`Booking application failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error during booking:', error);
            alert('An error occurred during the booking process. Please try again.');
        }
    };
    
      

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">Booking System</div>
        <ul className="dashboard-items">
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>
      <div className="dashboard-container">
        <section className="dashboard-content">
          <header className="dashboard-header">
            <h2>Make a Booking</h2>
          </header>
          <form onSubmit={handleSubmit} className="dashboard-info">
            {bookingDetails.guestDetails.map((guest, index) => (
                <div key={index}>
                    <input 
                        type="text"
                        name="guestName"
                        value={guest.guestName}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Guest Name"
                        required
                    />
                    <input 
                        type="tel"
                        name="phone"
                        value={guest.phone}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Phone"
                        required
                        />
                    <input 
                        type="text"
                        name="visitorIdCard"
                        value={guest.visitorIdCard}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="ID Card Number"
                        required
                        />
                        <input
                        type="text"
                        name="address"
                        className='address-input'
                        value={guest.address}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Address"
                        required
                        />
                        <input 
                        type="email"
                        name="email"
                        value={guest.email}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Email"
                        required
                        />
                        <input 
                        type="text"
                        name="relationshipWithUser"
                        value={guest.relationshipWithUser}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Relationship with User"
                        required
                        />
                        {bookingDetails.guestDetails.length > 1 && (
                    <button type="button" onClick={() => handleRemoveGuest(index)}>Remove Guest</button>
                    )}
                </div>
            ))}
            <button type="button" onClick={handleAddGuest}>Add Another Guest</button>

            <input 
              type="number"
              name="preferredOccupancy"
              value={bookingDetails.preferredOccupancy}
              onChange={(e) => handleChange(e)}
              placeholder="Preferred Occupancy"
              required
            />
            
            <input 
              type="datetime-local"
              name="timeOfDeparture"
              value={bookingDetails.timeOfDeparture}
              onChange={(e) => handleChange(e)}
              required
            />
            <input 
              type="datetime-local"
              name="timeOfArrival"
              value={bookingDetails.timeOfArrival}
              onChange={(e) => handleChange(e)}
              required
            />
            <input 
                type="text"
              name="purposeOfVisit"
              value={bookingDetails.purposeOfVisit}
              onChange={(e) => handleChange(e)}
              placeholder="Purpose of Visit"
              required
            />
            
            <button type="submit" className="dashboard-button">Submit Booking</button>
          </form>
        </section>
      </div>
      <footer className="dashboard-footer">
        <p>&copy; 2024 GuestHouse Booking System</p>
      </footer>
    </>
  );
};

export default BookingPage;
