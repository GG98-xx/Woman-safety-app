const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes      = require('./routes/auth');
const incidentRoutes  = require('./routes/incidents');
const adminRoutes     = require('./routes/admin');
const authorityRoutes = require('./routes/authority');
const alertRoutes = require('./routes/alerts');
app.use('/api/alerts', alertRoutes);

app.use('/api/auth',      authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/authority', authorityRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Women Safety API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});