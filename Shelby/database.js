//This is database.js in /Shelby/
const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: '127.0.0.1',        // Database host
    user: 'root',     // Your MySQL username
    password: '555666',  // Your MySQL password
    database: 'user_accounts',   // Your database name
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0,
});

// Export the pool for use in other modules
module.exports = pool;