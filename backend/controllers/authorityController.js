const db = require('../config/db');

const getAssignedIncidents = async (req, res) => {
    try {
        const [incidents] = await db.query(
            `SELECT i.*, l.city, l.area, u.name AS reported_by,
                    a.priority, a.assigned_date
             FROM ASSIGNMENTS a
             JOIN INCIDENTS  i ON a.incident_id  = i.id
             JOIN LOCATIONS  l ON i.location_id  = l.id
             JOIN USERS      u ON i.user_id       = u.id
             WHERE a.authority_id = ?
             ORDER BY i.date_time DESC`,
            [req.user.id]
        );
        res.json(incidents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const resolveIncident = async (req, res) => {
    const { status, notes } = req.body;
    const { incidentId } = req.params;

    try {
        await db.query(
            'UPDATE INCIDENTS SET status = ? WHERE id = ?',
            [status, incidentId]
        );
        res.json({ message: 'Incident updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getAssignedIncidents, resolveIncident };