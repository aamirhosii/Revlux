//This is userController.js
const bcrypt = require('bcryptjs');
//const mysql = require('mysql2');

// Assuming you have the MySQL connection set up in server.js
//const db = require('../../Shelby/database'); // Adjust this import according to your file structure
const pool = require('../../Shelby/database');

const users = []; 

exports.createAccount = async (req, res) => {
    console.log('Create account called with:', req.body);
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    try{
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        console.log('user already exists');
        return res.status(400).json({ message: 'User already exists' });
        
    }

    // Simple validation
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
        console.log('One or more fields are not filed in');
        return res.status(400).json({ message: 'All fields are required' });
        
    }

    // Hash the password
    const passwordHash = bcrypt.hashSync(password, 8);

    // Save user data to the database
    await pool.query(
        'INSERT INTO users (first_name, last_name, email, phone_number, password'
    )

    // Save user data (You would typically save this to a database)
    const newUser = {
        firstName,
        lastName,
        email,
        phoneNumber,
        passwordHash,
        createdAt: new Date(),
    };


    users.push(newUser); // Store user (replace with DB logic)

    return res.status(201).json({ message: 'Account created successfully!' });
    }
    catch (error) 
    {
        console.error('Error creating account:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//Login Logic
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try
    {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if(!user)
        {
            return res.status(404).json({ message: 'User not found'});
        }

        // Compare the provided password with the hashed password
        const isMatch = bcrypt.compareSync(password, user.password_hash);

        if(!isMatch)
        {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        return res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};