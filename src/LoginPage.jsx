import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(username, password);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">GHBS</div>
        <ul className="nav-items">
          <li>About</li>
          <li>Contact</li>
          <li>Help</li>
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">Log In</button>
        </form>
        <div className="footer">
          <p>Not a member? <a href="#">Sign up now</a></p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
