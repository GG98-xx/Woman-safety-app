const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, contact_no, emerg_contact, role } = req.body;

    try {
        // Check if user exists
        const [existing] = await db.query(
            'SELECT * FROM USERS WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const userRole = role || 'user';
        await db.query(
            `INSERT INTO USERS (name, email, password, contact_no, emerg_contact, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, contact_no, emerg_contact, userRole]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query(
            'SELECT * FROM USERS WHERE email = ?', [email]
        );
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id:    user.id,
                name:  user.name,
                email: user.email,
                role:  user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, contact_no, emerg_contact, role FROM USERS WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};
const updateProfile = async (req, res) => {
    const { name, email, contact_no, emerg_contact, department } = req.body;
    try {
        await db.query(
            `UPDATE USERS SET name=?, email=?, contact_no=?, emerg_contact=?, department=? WHERE id=?`,
            [name, email, contact_no, emerg_contact, department, req.user.id]
        );
        res.json({ message: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM USERS WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
        const isMatch = await bcrypt.compare(current_password, users[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });
        const hashed = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE USERS SET password = ? WHERE id = ?', [hashed, req.user.id]);
        res.json({ message: 'Password changed successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };