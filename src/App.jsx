import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage'; // Import LoginPage component
import RegistrationPage from './RegistrationPage'; 
import Dashboard from './Dashboard'; // Import Dashboard component
import BookingPage from './BookingPage';
import BookingDetailsPage from './BookingDetails';

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
    </Routes>
  </Router>
  );
}

export default App;
