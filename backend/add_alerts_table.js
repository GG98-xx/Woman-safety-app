const db = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

db.query(`
  CREATE TABLE IF NOT EXISTS COMMUNITY_ALERTS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    city VARCHAR(50),
    status ENUM('Active','Resolved') DEFAULT 'Active',
    helpers INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(id)
  )
`).then(() => {
  console.log('Community alerts table created!');
  process.exit();
}).catch(e => {
  console.error(e.message);
  process.exit();
});