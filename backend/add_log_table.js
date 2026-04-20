const db = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

db.query(`
  CREATE TABLE IF NOT EXISTS INCIDENT_LOG (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES INCIDENTS(id) ON DELETE CASCADE
  )
`).then(() => {
  console.log('INCIDENT_LOG table created!');
  process.exit();
}).catch(e => {
  console.error(e.message);
  process.exit();
});