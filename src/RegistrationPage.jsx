import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function RegistrationPage() {
  const [formData, setFormData] = useState({
    username: '', // Added this line
    email: '',
    password: '',
    confirmPassword: '', // Changed from 'conformPassword'
    role: '',
    name: ''
  });
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation example
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Construct the user object to send to the server
    const userBody = {
      username: formData.username, // Changed from 'name'
      email: formData.email,
      password: formData.password,
      role: formData.role,
      name: formData.name
    };

    // Perform the user registration
    const userResponse = await performRegistration('http://localhost:3001/register', userBody);

    if (!userResponse) {
      console.error('User registration failed:', userResponse);
      return;
    }

    // Redirect the user based on the response status
    if (userResponse && userResponse.status === 'success') {
      navigate('/login');
    } else {
      console.error('User registration failed:', userResponse);
    }
  };

  // This function sends the registration request to the server
  const performRegistration = async (url, body) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      
      return await response.json();
    } catch (error) {
      console.error('There was an error!', error);
      return { status: 'error', message: error.message };
    }
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
          <h1>User Registration</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
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
            <label htmlFor="password">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
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
          <button type="submit" className="login-button">Register</button>
        </form>
        <div className="footer">
        <p>Already a member? <Link to="/login">Log in here</Link></p>
        </div>
      </div>
    </>
  );
}

export default RegistrationPage;