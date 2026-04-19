const db = require('../config/db');

const createIncident = async (req, res) => {
    const {
        type, description, location_id, channel_id,
        report_type, criminal_age, criminal_height, criminal_appearance,
        latitude, longitude
    } = req.body;
    const user_id = req.user.id;

    try {
        const criminal_photo = req.files?.criminal_photo?.[0]?.path || null;
        const evidence_file  = req.files?.evidence_file?.[0]?.path  || null;

        const [result] = await db.query(
            `INSERT INTO INCIDENTS (
                type, description, status, user_id, location_id, channel_id,
                report_type, criminal_age, criminal_height, criminal_appearance,
                criminal_photo, latitude, longitude, date_time
             ) VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [type, description, user_id, location_id, channel_id,
             report_type || 'Authorities', criminal_age, criminal_height,
             criminal_appearance, criminal_photo, latitude, longitude]
        );

        // Insert evidence if uploaded
        if (evidence_file) {
            await db.query(
                `INSERT INTO EVIDENCE (incident_id, file_type, file_url)
                 VALUES (?, ?, ?)`,
                [result.insertId, req.files.evidence_file[0].mimetype, evidence_file]
            );
        }

        res.status(201).json({
            message: 'Incident reported successfully!',
            incident_id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getMyIncidents = async (req, res) => {
    try {
        const [incidents] = await db.query(
            `SELECT i.*, l.city, l.area
             FROM INCIDENTS i
             LEFT JOIN LOCATIONS l ON i.location_id = l.id
             WHERE i.user_id = ?
             ORDER BY i.date_time DESC`,
            [req.user.id]
        );
        res.json(incidents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getIncidentById = async (req, res) => {
    try {
        const [incidents] = await db.query(
            `SELECT i.*, l.city, l.area, u.name AS reported_by
             FROM INCIDENTS i
             LEFT JOIN LOCATIONS l ON i.location_id = l.id
             LEFT JOIN USERS u     ON i.user_id     = u.id
             WHERE i.id = ?`,
            [req.params.id]
        );
        if (incidents.length === 0) {
            return res.status(404).json({ message: 'Incident not found.' });
        }
        res.json(incidents[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getAllIncidents = async (req, res) => {
    try {
        const [incidents] = await db.query(
            `SELECT i.*, l.city, l.area, u.name AS reported_by
             FROM INCIDENTS i
             LEFT JOIN LOCATIONS l ON i.location_id = l.id
             LEFT JOIN USERS u     ON i.user_id     = u.id
             ORDER BY i.date_time DESC`
        );
        res.json(incidents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const updateIncidentStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.query(
            'UPDATE INCIDENTS SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        res.json({ message: 'Status updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    createIncident,
    getMyIncidents,
    getIncidentById,
    getAllIncidents,
    updateIncidentStatus
};