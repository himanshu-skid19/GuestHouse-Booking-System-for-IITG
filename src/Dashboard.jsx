import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // The name of your CSS file for the dashboard
import axios from 'axios';

const Dashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch student information
    const fetchStudentInfo = async () => {
      try {
        const response = await fetch('http://localhost:3001/get-user-info', {
          credentials: 'include', // To send the session cookie with the request
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setStudentInfo(data); // Set the student information in state
      } catch (error) {
        console.error('Error fetching student data:', error);
        navigate('/login'); // Redirect to login if there's an issue (like not authenticated)
      }
    };

    fetchStudentInfo();
  }, [navigate]);

  if (!studentInfo) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or similar if you like
  }

  const handleLogout = async () => {
    try {
        const response = await fetch('http://localhost:3001/logout', { // Adjust URL as needed
            method: 'POST',
        });
        const responseData = await response.json();
        if (responseData.status === 'success') {
            // Optionally clear any client-side state here
            navigate('/login'); // Redirect to login page or wherever appropriate
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('There was an error!', error);
    }
  };

  const handleApply = async () => {
    try {
      const sessionResponse = await fetch('http://localhost:3001/check-session', {
        credentials: 'include', // Ensure cookies are sent
      });
      
      if (sessionResponse.ok) {
        // Session is valid, navigate to the booking page
        navigate('/booking');
      } else {
        // Handle session not valid
        alert('Session expired. Please log in again.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      alert('An error occurred. Please try again.');
    }
  };
  


  

  const handleBookings = async () => {
    try {
      // Use axios to send a GET request
      const response = await axios.get('http://localhost:3001/get-booking-details', {
        withCredentials: true, // Ensure cookies are sent
      });
  
      if (response.status === 200) {
        navigate('/booking-details', { state: { bookings: response.data } });
        console.log(response.data); // For now, just logging the data
      } else {
        // Handle any status other than 200 OK
        console.error('Error fetching bookings:', response.data.message);
        
      }
    } catch (error) {
      if (error.response) {
        // The server responded with a status other than 2xx
        console.error('Server responded with an error:', error.response.status);
        alert("No bookings found");
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something else happened in setting up the request
        console.error('Error:', error.message);
      }
    }
  };

  const handlePricing = async () => {
    navigate("/pricing-details");
  }
  
  

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">Student Portal</div>
        <ul className="dashboard-items">
          <li hred="/dashboard">Home</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
      <div className="dashboard-container">
        <section className="dashboard-content">
          <header className="dashboard-header">
            <h2>Welcome, {studentInfo.name}</h2>
          </header>
          <div className="dashboard-info">
            <p><strong>ID:</strong> {studentInfo.uid}</p>
            <p><strong>Email:</strong> {studentInfo.email}</p>
            {/* Display additional student information here */}
          </div>
          <div className="dashboard-actions">
            {/* Add buttons or links for the student to interact with */}
            <button onClick={handleApply} className="dashboard-button">Apply for Accomodation</button>
            <button onClick={handleBookings} className="dashboard-button">View Bookings</button>
            <button onClick={handlePricing} className="dashboard-button">Pricing Details</button>
            
      
          </div>
        </section>
      </div>
      <footer className="dashboard-footer">
        <p>GHBS| Indian Institute of Technology, Guwahati</p>
      </footer>
    </>
  );
};

export default Dashboard;
