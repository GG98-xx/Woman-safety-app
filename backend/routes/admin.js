const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    assignIncident,
    getAllAuthorities
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/stats',               verifyToken, isAdmin, getDashboardStats);
router.get('/users',               verifyToken, isAdmin, getAllUsers);
router.get('/authorities',         verifyToken, isAdmin, getAllAuthorities);
router.post('/assign/:incidentId', verifyToken, isAdmin, assignIncident);

module.exports = router;