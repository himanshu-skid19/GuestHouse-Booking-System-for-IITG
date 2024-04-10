import React, { useState, useEffect } from 'react';

import './Dashboard.css'; // The name of your CSS file for the dashboard
import { Link } from 'react-router-dom';

const About= () => {
      return (
        <>
        <nav className="dashboard-navbar">
        <div className="dashboard-brand">Student Portal</div>
        <ul className="dashboard-items">
        <li><Link to="/login">Home</Link></li>
        </ul>
      </nav>

      <div className="dashboard-container">
          <h1>About IITG Guesthouse Booking</h1>
          <div className="about-content">
            <h2>Experience Comfort & Convenience</h2>
            <p>
              The IIT Guwahati Guesthouse Booking System is your gateway to a comfortable stay on the serene campus of IITG. Our guesthouses are equipped to provide you with a peaceful environment amidst the natural beauty of the campus, perfect for relaxation and rejuvenation.
            </p>
            
            <h2>Modern Facilities in a Lush Setting</h2>
            <p>
              Our guesthouses boast modern amenities to ensure your stay is as convenient as it is comfortable. Each room is furnished to meet the needs of our diverse visitors, from academicians and students to families and tourists. Overlooking the Brahmaputra or nestled against the backdrop of green hillocks, every guesthouse room offers a unique view of the splendid IITG campus.
            </p>
            
            <h2>Seamless Booking Experience</h2>
            <p>
              The online booking system provides a seamless experience, from checking availability to securing a reservation. We value your time and our system is designed to offer a quick and user-friendly process, allowing you to focus on the purpose of your visit, be it academic collaboration, a leisurely tour, or a family visit.
            </p>
            
            <h2>Our Commitment to Hospitality</h2>
            <p>
              At IITG, we are committed to upholding the values of hospitality and service. Our staff is dedicated to making your stay memorable and ensuring that every aspect of your experience reflects the excellence that IIT Guwahati stands for.
            </p>
            
            <h2>Explore IIT Guwahati</h2>
            <p>
              While you are here, take the opportunity to explore the sprawling campus, interact with our vibrant community, and indulge in the cultural richness that IITG has to offer. Your stay at the IITG guesthouses is not just about comfort; it's about experiencing the dynamic spirit of one of India's premier institutions.
            </p>
          </div>

        </div>
        </>
        
      );
    };
    

    

export default About;
