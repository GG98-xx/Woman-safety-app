const createIncident = async (req, res) => {
    const {
        type, description, location_id, channel_id,
        report_type, criminal_age, criminal_height, criminal_appearance,
        latitude, longitude
    } = req.body;
    const user_id = req.user.id;

    const connection = await require('../config/db').getConnection();

    try {
        await connection.beginTransaction();

        const criminal_photo = req.files?.criminal_photo?.[0]?.path || null;
        const evidence_file  = req.files?.evidence_file?.[0]?.path  || null;

        const [result] = await connection.query(
            `INSERT INTO INCIDENTS (
                type, description, status, user_id, location_id, channel_id,
                report_type, criminal_age, criminal_height, criminal_appearance,
                criminal_photo, latitude, longitude, date_time
             ) VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [type, description, user_id, location_id, channel_id,
             report_type || 'Authorities', criminal_age, criminal_height,
             criminal_appearance, criminal_photo, latitude, longitude]
        );

        if (evidence_file) {
            await connection.query(
                `INSERT INTO EVIDENCE (incident_id, file_type, file_url)
                 VALUES (?, ?, ?)`,
                [result.insertId, req.files.evidence_file[0].mimetype, evidence_file]
            );
        }

        // Log the transaction
        await connection.query(
            `INSERT INTO INCIDENT_LOG (incident_id, action, performed_by)
             VALUES (?, 'CREATED', ?)`,
            [result.insertId, user_id]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Incident reported successfully!',
            incident_id: result.insertId
        });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Transaction failed. Incident not saved.' });
    } finally {
        connection.release();
    }
};