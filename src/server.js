import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';

const saltRounds = 10;
const port = 3001; // You can choose any port that's free

// Set up Express app
const app = express();
app.use(session({
  secret: 'your_secret_key', // This is a secret key used to sign the session ID cookie. Replace 'your_secret_key' with a real secret string.
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // If you're serving your site over HTTPS, set secure to true.
}));
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Adjust the origin as per your React app's URL
app.use(bodyParser.json()); // Support json encoded bodies

// MySQL connection pool setup
const connection = mysql.createConnection({
  host: 'localhost', // or the IP address of your MySQL server
  user: 'root',
  password: '',
  database: 'guesthouse'
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});


// Registration endpoint
app.post('/register', async (req, res) => {
  const {username, email, password, role, name} = req.body;
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
      return;
    }

    const sql = "INSERT into users (username, email, passwordhash, role, name) VALUES (?, ?, ?, ?, ?)";
    connection.query(sql, [username, email, hashedPassword, role, name], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
        return;
      }

      console.log('User inserted successfully');
      res.status(200).json({ status: 'success' });
    });
  });
});


app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  connection.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
    if (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const hashedPassword = results[0].passwordhash;
    console.log('hashedPassword:', hashedPassword);
    console.log('password:', password);
    console.log('results:', results);
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
        return;
      }

      if (result) {
        req.session.user = results[0];
        res.status(200).json({ status: 'success' });
      } else {
        res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }
    });
  });
  
});


app.get('/get-user-info', (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    connection.query('SELECT * FROM users WHERE uid = ?', [req.session.user.uid], (error, results) => {
      if (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
        return;
      }

      // Assuming we got the user information correctly
      if (results.length > 0) {
        const userInfo = results[0];
        delete userInfo.passwordhash; // Remove the password hash for security reasons
        res.status(200).json(userInfo);
      } else {
        res.status(404).json({ status: 'error', message: 'User not found' });
      }
    });
  } else {
    res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }
});

app.get('/get-booking-details', (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    // Assuming you want to fetch the booking details for the logged-in user
    const user_id = req.session.user.uid;

    connection.query('SELECT * FROM bookings WHERE uid = ?', [user_id], (error, results) => {
      if (error) {
        console.error('Error fetching booking details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
        return;
      }

      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({ status: 'error', message: 'Booking details not found' });
      }
    });
  } else {
    res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }
});


app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.status(500).json({ status: 'error', message: 'Could not log out, please try again' });
    } else {
      res.clearCookie('connect.sid'); // The name 'connect.sid' is the default session ID cookie name, adjust if needed.
      res.json({ status: 'success', message: 'Logout successful' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
