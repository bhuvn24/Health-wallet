const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/shares', require('./routes/shares'));

// Test Route
app.get('/', (req, res) => {
    res.send('Health Wallet API is running');
});

// Sync Database and Start Server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database sync error:', err);
});
