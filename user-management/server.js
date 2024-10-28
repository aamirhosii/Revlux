//This is server.js
const express = require('express');         
const bodyParser = require('body-parser'); 
const bcrypt = require('bcryptjs');
const cors = require('cors');        
//const mysql = require('mysql2/promise');       
const userRoutes = require('./routes/user');    //Import user routes

const app = express();              
app.use(cors());                    
app.use(bodyParser.json());        //Middleware

app.use('/api/user', userRoutes);

// MySQL connection setup
/*const db = mysql.createConnection({
    host: '127.0.0.1', // Database host
    user: 'root', // Your MySQL username
    password: '555666', // Your MySQL password
    database: 'user_accounts', // Your database name
});*/

/*db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});*/


// Create a connection pool
/*const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '555666',
    database: 'user_accounts',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});*/

// Create Account Endpoint
app.post('/create-account', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    
    try {
        // Insert user into the database
        await pool.query('INSERT INTO users (firstName, lastName, email, phoneNumber, password) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, phoneNumber, password]);
        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Make the pool available for routes
/*app.use((req, res, next) => {
    req.pool = pool;
    next();
});*/

app.use('/api/users', userRoutes);  //Use user routes with a base path

const PORT = process.env.PORT || 3000;  

app.listen(PORT, () => {                
    console.log(`Server is running on port ${PORT}`);
});
console.log('end of server.js');