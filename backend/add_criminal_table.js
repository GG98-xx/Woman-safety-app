const db = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

const queries = [
  `ALTER TABLE INCIDENTS ADD COLUMN report_type ENUM('Authorities','Community') DEFAULT 'Authorities'`,
  `ALTER TABLE INCIDENTS ADD COLUMN criminal_age VARCHAR(20)`,
  `ALTER TABLE INCIDENTS ADD COLUMN criminal_height VARCHAR(20)`,
  `ALTER TABLE INCIDENTS ADD COLUMN criminal_appearance TEXT`,
  `ALTER TABLE INCIDENTS ADD COLUMN criminal_photo VARCHAR(255)`,
  `ALTER TABLE INCIDENTS ADD COLUMN latitude DECIMAL(9,6)`,
  `ALTER TABLE INCIDENTS ADD COLUMN longitude DECIMAL(9,6)`,
];

const runAll = async () => {
  for (const q of queries) {
    try {
      await db.query(q);
      console.log('Done:', q.substring(0, 50));
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('Already exists, skipping...');
      } else {
        console.log('Error:', e.message);
      }
    }
  }
  console.log('All done!');
  process.exit();
};

runAll();