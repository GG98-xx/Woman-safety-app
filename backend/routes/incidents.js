const express = require('express');
const router = express.Router();
const {
    createIncident,
    getMyIncidents,
    getIncidentById,
    getAllIncidents,
    updateIncidentStatus
} = require('../controllers/incidentController');
const { verifyToken, isAdminOrAuthority } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// User routes
router.post('/', verifyToken, upload.fields([
    { name: 'criminal_photo', maxCount: 1 },
    { name: 'evidence_file',  maxCount: 1 }
]), createIncident);

router.get('/my',         verifyToken, getMyIncidents);
router.get('/:id',        verifyToken, getIncidentById);

// Admin/Authority routes
router.get('/',           verifyToken, isAdminOrAuthority, getAllIncidents);
router.put('/:id/status', verifyToken, isAdminOrAuthority, updateIncidentStatus);

module.exports = router;