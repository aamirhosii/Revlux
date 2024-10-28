//This is user.js
console.log('user.js');
//const { createUser } = require('../controllers/userController');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
/*router.post('/create-account', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    try {
        await createUser(firstName, lastName, email, phoneNumber, password);
        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});*/

// Define routes for user management
router.post('/create-account', userController.createAccount);
// Add more routes as needed (e.g., login, get user info)

module.exports = router;
console.log('User routes loaded');