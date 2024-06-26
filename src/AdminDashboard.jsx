import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // The name of your CSS file for the dashboard
import axios from 'axios';

const AdminDashboard = () => {
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


  
  

  const handleBookings = async () => {
    try {
        const sessionResponse = await fetch('http://localhost:3001/check-session', {
          credentials: 'include', // Ensure cookies are sent
        });
        
        if (sessionResponse.ok) {
          // Session is valid, navigate to the booking page
          navigate('/admin-booking');
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

  const handlePricing = async () => {
    navigate("/pricing-details");
  }
  

  return (
    <>
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">Student Portal</div>
        <ul className="dashboard-items">
          <li href="/admin-dashboard">Home</li>
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

export default AdminDashboard;
