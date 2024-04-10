import React, { useState, useEffect } from 'react';

import './Dashboard.css'; // The name of your CSS file for the dashboard
import { Link } from 'react-router-dom';

const PricingDetails= () => {
      return (
        <>
        <nav className="dashboard-navbar">
        <div className="dashboard-brand">Student Portal</div>
        <ul className="dashboard-items">
        <li><Link to="/login" className="dashboard-link">Home</Link></li>
        </ul>
      </nav>
      

      <div className="dashboard-container">
        <h2>Students</h2>
        Students get no discount 
        </div>

        <h2>Faculty</h2>
        Faculty get 15% discount on booking

        <h2>Department Heads/ Deans</h2>
        Department Heads/ Deans get 25% discount on booking

        <h2>External Guests</h2>
        External Guests get 10% discount on booking
        </>
        
      );
    };
    

    

export default PricingDetails;
