-- ============================================================
-- Women Safety & Incident Reporting System
-- Database setup for FreeSQLDatabase
-- ============================================================

CREATE TABLE IF NOT EXISTS USERS (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    contact_no    VARCHAR(15),
    emerg_contact VARCHAR(15),
    role          ENUM('user', 'admin', 'authority') DEFAULT 'user',
    department    VARCHAR(100),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS LOCATIONS (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    city        VARCHAR(50)  NOT NULL,
    area        VARCHAR(100),
    latitude    DECIMAL(9,4),
    longitude   DECIMAL(9,4)
);

CREATE TABLE IF NOT EXISTS CHANNELS (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    channel_type VARCHAR(50)  NOT NULL,
    platform     VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS INCIDENTS (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL,
    description TEXT,
    status      ENUM('Pending','Under Review','Resolved','Completed') DEFAULT 'Pending',
    date_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id     INT NOT NULL,
    location_id INT,
    channel_id  INT,
    FOREIGN KEY (user_id)     REFERENCES USERS(id),
    FOREIGN KEY (location_id) REFERENCES LOCATIONS(id),
    FOREIGN KEY (channel_id)  REFERENCES CHANNELS(id)
);

CREATE TABLE IF NOT EXISTS EVIDENCE (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    file_type   VARCHAR(20),
    file_url    VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES INCIDENTS(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ASSIGNMENTS (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    incident_id   INT NOT NULL,
    admin_id      INT NOT NULL,
    authority_id  INT NOT NULL,
    assigned_date DATE,
    priority      ENUM('Low','Medium','High','Critical') DEFAULT 'Medium',
    FOREIGN KEY (incident_id)  REFERENCES INCIDENTS(id),
    FOREIGN KEY (admin_id)     REFERENCES USERS(id),
    FOREIGN KEY (authority_id) REFERENCES USERS(id)
);

INSERT INTO LOCATIONS (city, area, latitude, longitude) VALUES
('Mumbai',    'Mulund',        19.0760, 72.8777),
('Delhi',     'MG Road',       28.6139, 77.2090),
('Pune',      'Shivajinagar',  18.5204, 73.8567),
('Bangalore', 'Koramangala',   12.9716, 77.5946),
('Kolkata',   'Salt Lake',     22.5726, 88.3639);

INSERT INTO CHANNELS (channel_type, platform) VALUES
('SOS Button',     'Mobile App'),
('Online Form',    'Web Portal'),
('Phone Call',     'Helpline 181'),
('SMS',            'Short Code 100'),
('Walk-in Report', 'Police Station');

INSERT INTO USERS (name, email, password, contact_no, role) VALUES
('Admin', 'admin@womenssafety.com',
'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'9999999999', 'admin');

INSERT INTO USERS (name, email, password, contact_no, role, department) VALUES
('Mumbai Police', 'police@womenssafety.com',
'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'8888888888', 'authority', 'Mumbai Police');