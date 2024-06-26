import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { MailSlurp } from 'mailslurp-client'
import dotenv from 'dotenv';



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




// Helper function to run query and return results in a promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Using runQuery in an Express route
app.get('/get-user-info', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }

  try {
    const uid = req.session.user.uid;
    const results = await runQuery('SELECT * FROM users WHERE uid = ?', [uid]);

    if (results.length > 0) {
      const userInfo = results[0];
      delete userInfo.passwordhash; // Removing sensitive data
      res.status(200).json(userInfo);
    } else {
      res.status(404).json({ status: 'error', message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
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

app.get('/check-session', (req, res) => {
  // Check if user is stored in session
  console.log('Session:', req.session);
  if (req.session.user) {
    const user = { ...req.session.user };
    // Optionally remove sensitive information before sending the response
    delete user.passwordhash; // Assuming 'passwordhash' is the key holding password data
    
    res.json({
      status: 'success',
      message: 'Session is active',
      user: user
    });
  } else {
    res.status(401).json({ // Using 401 status code to indicate unauthorized access
      status: 'error',
      message: 'No active session found'
    });
  }
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
        res.status(200).json({results, status: 'success'});
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

app.get('/get-pending-bookings', (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    const user_id = req.session.user.uid;

    // Adjusted query to exclude 'accepted' and 'rejected' bookings
    const query = 'SELECT * FROM bookings WHERE status NOT IN (?, ?)';

    connection.query(query, ['accepted', 'rejected'], (error, results) => {
      if (error) {
        console.error('Error fetching pending booking details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
        return;
      }

      if (results.length > 0) {
        res.status(200).json(results);
      } else {
        res.status(404).json({ status: 'error', message: 'Pending booking details not found' });
      }
    });
  } else {
    res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }
});

// Endpoint to update the status of a booking
app.put('/update-booking-status/:bookingId', (req, res) => {
  // Extract the bookingId from the URL parameters and the new status from the request body
  const { bookingId } = req.params;
  const { status } = req.body;

  // Check if the user is logged in and has the correct permission to update a booking
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }

  // Update the booking status in the database
  const updateQuery = 'UPDATE bookings SET status = ? WHERE bid = ?';

  connection.query(updateQuery, [status, bookingId], (error, result) => {
    if (error) {
      console.error('Error updating booking status:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      // No booking found with the given ID
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    // Successfully updated the booking status
    res.json({ status: 'success', message: 'Booking status updated successfully' });
  });
});


app.get('/get-booking-details/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }
  
  try {
    const bookingDetailsQuery = 'SELECT * FROM bookingdetails WHERE bid = ?';
    // Now we expect multiple booking details rows for each booking ID.
    const bookingDetails = await runQuery(bookingDetailsQuery, [bookingId]);
    console.log('Booking details:', bookingDetails)

    if (bookingDetails.length > 0) {
      // Send the entire array of booking details in the response.
      res.json({ status: 'success', bookingDetails });
    } else {
      res.status(404).json({ status: 'error', message: 'Booking details not found' });
    }
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});




app.post('/apply-booking', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }

  const uid = req.session.user.uid; // Retrieved from the session
  const { guestDetails, preferredOccupancy, startDate, endDate, purposeOfVisit, preferredRoom, preferredGuesthouse, remarks } = req.body;

  // Validate incoming data for the main booking details
  if (!guestDetails || !preferredOccupancy || !startDate || !endDate) {
    return res.status(400).json({ status: 'error', message: 'Missing required booking details' });
  }

  // First, retrieve the user's role from the database
  connection.query('SELECT role FROM users WHERE uid = ?', [uid], (error, results) => {
    if (error) {
      console.error('Error fetching user role:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const userRole = results[0].role;
    // Determine if the booking should be marked as official based on role
    const isOfficial = ['dept_heads', 'admin'].includes(userRole); // Adjust roles as needed
    const userEmail = results[0].email;


    // Start the transaction
    connection.beginTransaction(err => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ status: 'error', message: 'Error starting transaction' });
      }

      // Insert booking data without specifying room details
      const insertBookingQuery = 'INSERT INTO bookings (uid, startDate, endDate, status, isofficial, createdat, remarks) VALUES (?, ?, ?, ?, ?, NOW(), remarks)';
      const status = 'pending'; // or any other default status you have

      connection.query(insertBookingQuery, [uid, startDate, endDate, status, isOfficial, remarks], (error, bookingResult) => {
        if (error) {
          console.error('Error inserting booking:', error);
          return connection.rollback(() => {
            res.status(500).json({ status: 'error', message: 'Error inserting booking' });
          });
        }

        const bookingId = bookingResult.insertId;
        const guestEmails = guestDetails.map(guest => guest.email).filter(email => email);


        // Insert booking details for each guest, including the purposeOfVisit for each, now including preferredRoom and preferredGuesthouse
        guestDetails.forEach((guest, index) => {
          const { guestName, phone, visitorIdCard, address, email, relationshipWithUser } = guest;
          const insertBookingDetailsQuery = 'INSERT INTO bookingdetails (bid, guestname, phone, visitoridcard, address, email, relationshipwithuser, purposeofvisit, preferredRoom, preferredGuesthouse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

          connection.query(insertBookingDetailsQuery, [bookingId, guestName, phone, visitorIdCard, address, email, relationshipWithUser, purposeOfVisit, preferredRoom, preferredGuesthouse], (error) => {
            if (error) {
              console.error(`Error inserting booking details for guest ${index}:`, error);
              return connection.rollback(() => {
                res.status(500).json({ status: 'error', message: 'Error inserting booking details' });
              });
            }

            const emailSubject = 'Guesthouse Booking Request Confirmation';
            const emailContent = `
                                  Hello,

                                  Your booking has been successfully confirmed with the following details:

                                  Booking ID: ${bookingId}
                                  Start Date: ${new Date(startDate).toLocaleDateString()}
                                  End Date: ${new Date(endDate).toLocaleDateString()}
                                  Purpose of Visit: ${purposeOfVisit}
                                  Preferred Guesthouse: ${preferredGuesthouse || 'Any available'}
                                  Preferred Room: ${preferredRoom || 'Any available'}
                                  Remarks: ${remarks || 'None'}

                                  Guest Details:
                                  ${guestDetails.map((guest, index) => `
                                    Guest #${index + 1}:
                                    Name: ${guest.guestName}
                                    Phone: ${guest.phone}
                                    Email: ${guest.email}
                                    ID Card: ${guest.visitorIdCard}
                                    Address: ${guest.address}
                                    Relationship with User: ${guest.relationshipWithUser}
                                  `).join('')}

                                  Please contact us if you have any questions or need further information.

                                  Best regards,
                                  [Your Guesthouse/Hotel Name]
                                  `;

            // Commit only after the last guest details are inserted
            if (index === guestDetails.length - 1) {
              connection.commit(err => {
                if (err) {
                  console.error('Error during commit:', err);
                  return connection.rollback(() => {
                    res.status(500).json({ status: 'error', message: 'Error during commit' });
                  });
                }
                res.status(200).json({ status: 'success', message: 'Booking applied successfully', bookingId });
              });
            }
          });
        });
      });
    });
  });
});


app.get('/determine-available-room', (req, res) => {
  const { arrivalDate, departureDate, preferredGuesthouse, preferredRoom } = req.query;
  
  // Call your determineAvailableRoom function here
  determineAvailableRoom(arrivalDate, departureDate, preferredGuesthouse, preferredRoom, (error, roomDetails) => {
      if (error) {
          console.error('Error finding available room:', error);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }

      if (roomDetails) {
          // If a room is found, send room details as response
          res.json({ status: 'success', roomDetails });
      } else {
          // If no room is found, send a 404 response
          res.status(404).json({ status: 'error', message: 'No available room found' });
      }
  });
});


function determineAvailableRoom(arrivalDate, departureDate, preferredGuesthouse, preferredRoom, callback) {
  // Start with a base query that looks for all available rooms
  let baseQuery = `
    SELECT r.rid, r.roomno
    FROM rooms r
    WHERE NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.rid = r.rid
      AND (b.startdate < ? AND b.enddate > ?)
    )`;

  // If preferred guesthouse is specified, add it to the query
  if (preferredGuesthouse) {
    baseQuery += " AND r.gid IN (SELECT gid FROM guesthouses WHERE name = ?)";
  }

  // If preferred room is specified, add it to the query
  if (preferredRoom) {
    baseQuery += " AND r.roomno = ?";
  }

  baseQuery += " LIMIT 1;";

  // Parameters for the query, dynamically including preferred options if provided
  let queryParams = [departureDate, arrivalDate]; // Note the order of dates for correct comparison
  if (preferredGuesthouse) queryParams.push(preferredGuesthouse);
  if (preferredRoom) queryParams.push(preferredRoom);

  // Execute the query with the constructed parameters
  connection.query(baseQuery, queryParams, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      if(results.length > 0) {
        // Room available, return it
        callback(null, results[0]);
      } else {
        // No room available
        callback(null, null);
      }
    }
  });
}


function getUserRole(uid, callback) {
  connection.query('SELECT role FROM users WHERE uid = ?', [uid], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    if (results.length > 0) {
      return callback(null, results[0].role);
    }
    return callback(null, null);
  });
}

function getPricePerNight(roomno, callback) {
  connection.query('SELECT pricepernight FROM rooms WHERE roomno= ?', [roomno], (error, results) => {
    if (error) {
      return callback(error, null);
    }
    if (results.length > 0) {
      return callback(null, results[0].pricepernight);
    }
    return callback(null, 0);
  });
}


function calculatePrice(uid, roomno, startDate, endDate, callback) {
  // Placeholder for the price calculation logic
  // Assume `getUserRole` and `getPricePerNight` are implemented elsewhere
  
  getUserRole(uid, (err, role) => {
    if (err) {
      return callback(err, null);
    }
    
    getPricePerNight(roomno, (err, pricePerNight) => {
      if (err) {
        return callback(err, null);
      }
      
      const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24);
      let discount = 0;
      
      switch (role) {
        case 'faculty':
          discount = 0.15; // 15% discount
          break;
        case 'dept_heads':
          discount = 0.25; // 25% discount
          break;
        case 'external':
          discount = 0.10; // 10% discount
          break;
        // No discount for students and other roles
      }
      
      const finalPrice = pricePerNight * days * (1 - discount);
      callback(null, finalPrice);
    });
  });
}


app.get('/calculate-booking-cost', async (req, res) => {
  // Extract the required parameters from the request query
  const { uid, roomno, startDate, endDate } = req.query;

  // Validate the incoming data
  if (!uid || !roomno || !startDate || !endDate) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required parameters: uid, rid, startDate, endDate'
    });
  }

  // Convert dates to appropriate format if necessary
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Use calculatePrice function to determine the price
  calculatePrice(uid, roomno, start, end, (error, price) => {
    if (error) {
      console.error('Error calculating price:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }

    // If price calculation is successful, send the price in response
    console.log('Total cost:', price);
    res.json({
      status: 'success',
      totalCost: price
    });
  });
});

app.put('/update-booking/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const { status, roomno, remarks, finalPrice } = req.body; // Include finalPrice in the destructured body

  // Check if the user is logged in and has the permission to update a booking
  if (!req.session.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No session found' });
  }

  try {
    // Find the room ID (rid) using the room number (roomno)
    const roomDetails = await runQuery('SELECT rid FROM rooms WHERE roomno = ?', [roomno]);
    if (roomDetails.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Room not found' });
    }
    const rid = roomDetails[0].rid;

    // Update the booking record with the new details
    const updateQuery = 'UPDATE bookings SET status = ?, rid = ?, remarks = ?, finalprice = ? WHERE bid = ?';
    await runQuery(updateQuery, [status, rid, remarks, finalPrice, bookingId]);

    res.json({ status: 'success', message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
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
