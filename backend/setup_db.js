const mysql = require('mysql2');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT
});

const sql = fs.readFileSync('./db_setup.sql', 'utf8');
const queries = sql.split(';').filter(q => q.trim());

connection.connect((err) => {
    if (err) {
        console.error('Connection failed:', err.message);
        return;
    }
    console.log('Connected to database!');

    let i = 0;
    const runNext = () => {
        if (i >= queries.length) {
            console.log('Database setup complete!');
            connection.end();
            return;
        }
        connection.query(queries[i++], (err) => {
            if (err && !err.message.includes('already exists')) {
                console.error('Error:', err.message);
            }
            runNext();
        });
    };
    runNext();
});