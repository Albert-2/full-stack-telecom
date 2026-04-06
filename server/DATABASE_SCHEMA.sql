-- ========================================
-- TELECOM NETWORK MONITORING SYSTEM - SQL SCHEMA
-- ========================================

-- 1. CREATE USERS TABLE
CREATE TABLE users (
    id       INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 2. CREATE NETWORK_LOGS TABLE
CREATE TABLE network_logs (
    id               INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    latitude         DOUBLE NOT NULL,
    longitude        DOUBLE NOT NULL,
    signal_strength  VARCHAR(20) NOT NULL,
    signal_dbm       INT NOT NULL,
    timestamp        TIMESTAMP NOT NULL
);

-- 3. CREATE TOWERS TABLE
CREATE TABLE towers (
    id               INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    latitude         DOUBLE NOT NULL,
    longitude        DOUBLE NOT NULL,
    speed            DOUBLE NOT NULL,
    latency          INT NOT NULL,
    bandwidth        DOUBLE NOT NULL,
    signal_strength  VARCHAR(20) NOT NULL
);

-- 4. CREATE USER_LOCATION TABLE (for roaming simulation)
CREATE TABLE user_location (
    id          INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    lat         DOUBLE NOT NULL,
    lang        DOUBLE NOT NULL,
    signal_type VARCHAR(10) NOT NULL,
    latency     INT NOT NULL
);

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- INSERT TEST USERS
INSERT INTO users (email, password) VALUES ('user1@test.com', 'password123');
INSERT INTO users (email, password) VALUES ('user2@test.com', 'password456');
INSERT INTO users (email, password) VALUES ('user3@test.com', 'secure@pass');

-- INSERT NETWORK LOGS
INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)
VALUES (19.0760, 72.8777, 'Strong', -50, CURRENT_TIMESTAMP);
INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)
VALUES (19.0820, 72.8850, 'Strong', -45, CURRENT_TIMESTAMP);
INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)
VALUES (19.0880, 72.8900, 'Medium', -65, CURRENT_TIMESTAMP);
INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)
VALUES (19.0940, 72.8950, 'Medium', -68, CURRENT_TIMESTAMP);
INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)
VALUES (19.1000, 72.9010, 'Weak', -85, CURRENT_TIMESTAMP);
INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)
VALUES (19.1060, 72.9070, 'Strong', -55, CURRENT_TIMESTAMP);

-- INSERT TOWERS
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.0760, 72.8777, 100.0, 12, 20.0, 'Strong');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.0820, 72.8850, 95.0, 10, 20.0, 'Strong');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.0880, 72.8900, 50.0, 35, 15.0, 'Medium');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.0940, 72.8950, 48.0, 40, 15.0, 'Medium');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.1000, 72.9010, 15.0, 90, 10.0, 'Weak');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.1060, 72.9070, 98.0, 13, 20.0, 'Strong');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.1120, 72.9130, 52.0, 38, 15.0, 'Medium');
INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)
VALUES (19.1180, 72.9180, 16.0, 85, 10.0, 'Weak');

-- INSERT USER LOCATION DATA (Roaming Route)
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.0760, 72.8777, '5G', 12);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.0820, 72.8850, '5G', 10);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.0880, 72.8900, '5G', 14);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.0940, 72.8950, '5G', 11);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1000, 72.9010, '5G', 13);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1060, 72.9070, '4G', 45);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1120, 72.9130, '4G', 50);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1180, 72.9180, '4G', 48);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1240, 72.9240, '4G', 52);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1300, 72.9300, '5G', 15);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1360, 72.9360, '5G', 12);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1420, 72.9420, '5G', 10);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1480, 72.9480, '4G', 47);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1540, 72.9540, '4G', 55);
INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (19.1600, 72.9600, '4G', 60);

-- ========================================
-- USEFUL QUERIES
-- ========================================

-- View all users
SELECT * FROM users;

-- View all network logs (latest first)
SELECT * FROM network_logs ORDER BY timestamp DESC;

-- View all towers
SELECT * FROM towers;

-- Find towers by signal strength
SELECT * FROM towers WHERE signal_strength = 'Strong';

-- View recent network logs (last 20)
SELECT * FROM network_logs ORDER BY timestamp DESC LIMIT 20;

-- Calculate average latency by signal strength
SELECT
    signal_strength,
    AVG(latency) as avg_latency,
    COUNT(*) as tower_count
FROM towers
GROUP BY signal_strength;

-- Find nearest tower to a specific location
SELECT * FROM towers
ORDER BY SQRT(POWER(latitude - 19.09, 2) + POWER(longitude - 72.89, 2))
LIMIT 1;

-- Count logs by signal strength
SELECT signal_strength, COUNT(*) as log_count FROM network_logs GROUP BY signal_strength;
