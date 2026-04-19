const express = require('express');
const router = express.Router();
const {
    getAssignedIncidents,
    resolveIncident
} = require('../controllers/authorityController');
const { verifyToken, isAuthority } = require('../middleware/auth');

router.get('/assigned',        verifyToken, isAuthority, getAssignedIncidents);
router.put('/resolve/:incidentId', verifyToken, isAuthority, resolveIncident);

module.exports = router;