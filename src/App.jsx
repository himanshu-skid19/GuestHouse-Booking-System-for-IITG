import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage'; // Import LoginPage component
import RegistrationPage from './RegistrationPage'; 
import Dashboard from './Dashboard'; // Import Dashboard component
import BookingPage from './BookingPage';
import BookingDetailsPage from './BookingDetails';
import AdminDashboard from './AdminDashboard';
import AdminBooking from './AdminBooking';
import PricingDetails from './PricingDetails';
import About from './About';


function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/booking-details" element={<BookingDetailsPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-booking" element={<AdminBooking/>} />
      <Route path="/pricing-details" element={<PricingDetails />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </Router>
  );
}

export default App;
