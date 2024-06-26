import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log(response);

      if (responseData.status === 'success') {
        // Adjusted to fetch the role from the first element of the results array
        const userRole = responseData.results[0].role;
        
        if (userRole === 'admin') {
          navigate('/admin-dashboard'); // Redirect to the admin dashboard if the user is an admin
        } else {
          navigate('/dashboard'); // Redirect to the general user dashboard for all other roles
        }
      } else {
        alert('Invalid credentials. Please try again.');
      }
    }
    catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">GHBS</div>
        <ul className="dashboard-items">
          <li><Link to="/login" className="dashboard-link">Home</Link></li>
          <li><Link to="/about" className="dashboard-link">About</Link></li>
          <li>Contact</li>
        </ul>
      </nav>
      <div className="login-container">
        <div className="login-title">
          <h1>GuestHouse Booking System</h1>
          <h2>Welcome!!</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
            >
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="external">External Guest</option>
            <option value="dept_heads">Deans/Department Heads</option>
            </select>
          </div>
          <button type="submit" className="login-button">Log In</button>
        </form>
        <div className="footer">
        <Link to="/register">Don't have an account? Sign up</Link>
        </div>
        
      </div>
    </>
  );
};

export default LoginPage;
