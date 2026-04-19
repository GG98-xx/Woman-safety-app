const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Create community alert
router.post('/', verifyToken, async (req, res) => {
    const { message, latitude, longitude, city } = req.body;
    const db = require('../config/db');
    try {
        await db.query(
            `INSERT INTO COMMUNITY_ALERTS (user_id, message, latitude, longitude, city)
             VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, message, latitude, longitude, city]
        );
        res.status(201).json({ message: 'Community alert sent!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Get all active alerts
router.get('/', verifyToken, async (req, res) => {
    const db = require('../config/db');
    try {
        const [alerts] = await db.query(
            `SELECT ca.*, u.name AS sent_by
             FROM COMMUNITY_ALERTS ca
             JOIN USERS u ON ca.user_id = u.id
             WHERE ca.status = 'Active'
             ORDER BY ca.created_at DESC`
        );
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Mark as helped
router.put('/:id/help', verifyToken, async (req, res) => {
    const db = require('../config/db');
    try {
        await db.query(
            'UPDATE COMMUNITY_ALERTS SET helpers = helpers + 1 WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Marked as helping!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Resolve alert
router.put('/:id/resolve', verifyToken, async (req, res) => {
    const db = require('../config/db');
    try {
        await db.query(
            "UPDATE COMMUNITY_ALERTS SET status = 'Resolved' WHERE id = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Alert resolved!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;