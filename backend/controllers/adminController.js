const db = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const [[{ total }]]    = await db.query('SELECT COUNT(*) AS total FROM INCIDENTS');
        const [[{ pending }]]  = await db.query("SELECT COUNT(*) AS pending FROM INCIDENTS WHERE status = 'Pending'");
        const [[{ resolved }]] = await db.query("SELECT COUNT(*) AS resolved FROM INCIDENTS WHERE status IN ('Resolved','Completed')");
        const [[{ users }]]    = await db.query("SELECT COUNT(*) AS users FROM USERS WHERE role = 'user'");

        res.json({ total, pending, resolved, users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, contact_no, role FROM USERS WHERE role = 'user'"
        );
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getAllAuthorities = async (req, res) => {
    try {
        const [authorities] = await db.query(
            "SELECT id, name, email, department FROM USERS WHERE role = 'authority'"
        );
        res.json(authorities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const assignIncident = async (req, res) => {
    const { authority_id, priority } = req.body;
    const { incidentId } = req.params;

    try {
        // Check if assignment already exists
        const [existing] = await db.query(
            'SELECT * FROM ASSIGNMENTS WHERE incident_id = ?', [incidentId]
        );

        if (existing.length > 0) {
            await db.query(
                'UPDATE ASSIGNMENTS SET authority_id = ?, priority = ? WHERE incident_id = ?',
                [authority_id, priority || 'Medium', incidentId]
            );
        } else {
            await db.query(
                `INSERT INTO ASSIGNMENTS (incident_id, admin_id, authority_id, assigned_date, priority)
                 VALUES (?, ?, ?, CURDATE(), ?)`,
                [incidentId, req.user.id, authority_id, priority || 'Medium']
            );
        }

        // Update incident status
        await db.query(
            "UPDATE INCIDENTS SET status = 'Under Review' WHERE id = ?",
            [incidentId]
        );

        res.json({ message: 'Incident assigned successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getDashboardStats, getAllUsers, getAllAuthorities, assignIncident };