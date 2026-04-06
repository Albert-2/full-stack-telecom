package com.telecom;

import java.sql.*;

/**
 * DBSetup: Creates and seeds all required tables on first launch.
 * Idempotent - safe to call on every run.
 */
public class DBSetup {

    public static void createTableIfAbsent() {
        createUsersTable();
        createNetworkLogsTable();
        createTowersTable();
        createUserLocationTable();
    }

    // ── USERS TABLE ─────────────────────────────────────────────────────────
    private static void createUsersTable() {
        String sql = """
                CREATE TABLE users (
                    id       INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    email    VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL
                )
                """;
        createTable("users", sql);
    }

    // ── NETWORK_LOGS TABLE ───────────────────────────────────────────────────
    private static void createNetworkLogsTable() {
        String sql = """
                CREATE TABLE network_logs (
                    id               INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    latitude         DOUBLE NOT NULL,
                    longitude        DOUBLE NOT NULL,
                    signal_strength  VARCHAR(20) NOT NULL,
                    signal_dbm       INT NOT NULL,
                    timestamp        TIMESTAMP NOT NULL
                )
                """;
        createTable("network_logs", sql);
    }

    // ── TOWERS TABLE ────────────────────────────────────────────────────────
    private static void createTowersTable() {
        String sql = """
                CREATE TABLE towers (
                    id               INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    latitude         DOUBLE NOT NULL,
                    longitude        DOUBLE NOT NULL,
                    speed            DOUBLE NOT NULL,
                    latency          INT NOT NULL,
                    bandwidth        DOUBLE NOT NULL,
                    signal_strength  VARCHAR(20) NOT NULL
                )
                """;
        createTable("towers", sql);
    }

    // ── USER_LOCATION TABLE (keeps existing roaming simulation data) ────────
    private static void createUserLocationTable() {
        String sql = """
                CREATE TABLE user_location (
                    id          INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    lat         DOUBLE       NOT NULL,
                    lang        DOUBLE       NOT NULL,
                    signal_type VARCHAR(10)  NOT NULL,
                    latency     INT          NOT NULL
                )
                """;
        createTable("user_location", sql);
    }

    // ── Helper to create table ── ────────────────────────────────────────────
    private static void createTable(String tableName, String sql) {
        try (Connection conn = DBConnection.getConnection();
                Statement stmt = conn.createStatement()) {

            stmt.executeUpdate(sql);
            System.out.println("[DB] Table '" + tableName + "' created successfully.");

        } catch (SQLException e) {
            if ("X0Y32".equals(e.getSQLState())) {
                // Table already exists - this is expected
            } else {
                System.err.println("[ERROR] Failed to create table '" + tableName + "': " + e.getMessage());
            }
        }
    }

    // ── SEED DATA ───────────────────────────────────────────────────────────
    public static void seedDataIfAbsent() {
        seedUsersIfAbsent();
        seedNetworkLogsIfAbsent();
        seedTowersIfAbsent();
        seedUserLocationIfAbsent();
    }

    // ── Seed USERS TABLE ────────────────────────────────────────────────────
    private static void seedUsersIfAbsent() {
        if (hasData("users")) {
            System.out.println("[DB] Users already seeded — skipping insert.");
            return;
        }

        String sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        Object[][] users = {
                { "user1@test.com", "password123" },
                { "user2@test.com", "password456" },
                { "user3@test.com", "secure@pass" }
        };

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Object[] user : users) {
                ps.setString(1, (String) user[0]);
                ps.setString(2, (String) user[1]);
                ps.executeUpdate();
            }
            System.out.println("[DB] " + users.length + " user records inserted.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // ── Seed NETWORK_LOGS TABLE ────────────────────────────────────────────
    private static void seedNetworkLogsIfAbsent() {
        if (hasData("network_logs")) {
            System.out.println("[DB] Network logs already seeded — skipping insert.");
            return;
        }

        String sql = "INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)" +
                " VALUES (?, ?, ?, ?, ?)";
        Object[][] logs = {
                { 19.0760, 72.8777, "Strong", -50, new Timestamp(System.currentTimeMillis() - 300000) },
                { 19.0820, 72.8850, "Strong", -45, new Timestamp(System.currentTimeMillis() - 240000) },
                { 19.0880, 72.8900, "Medium", -65, new Timestamp(System.currentTimeMillis() - 180000) },
                { 19.0940, 72.8950, "Medium", -68, new Timestamp(System.currentTimeMillis() - 120000) },
                { 19.1000, 72.9010, "Weak", -85, new Timestamp(System.currentTimeMillis() - 60000) },
                { 19.1060, 72.9070, "Strong", -55, new Timestamp(System.currentTimeMillis()) }
        };

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Object[] log : logs) {
                ps.setDouble(1, (Double) log[0]);
                ps.setDouble(2, (Double) log[1]);
                ps.setString(3, (String) log[2]);
                ps.setInt(4, (Integer) log[3]);
                ps.setTimestamp(5, (Timestamp) log[4]);
                ps.executeUpdate();
            }
            System.out.println("[DB] " + logs.length + " network log records inserted.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // ── Seed TOWERS TABLE ───────────────────────────────────────────────────
    private static void seedTowersIfAbsent() {
        if (hasData("towers")) {
            System.out.println("[DB] Towers already seeded — skipping insert.");
            return;
        }

        String sql = "INSERT INTO towers (latitude, longitude, speed, latency, bandwidth, signal_strength)" +
                " VALUES (?, ?, ?, ?, ?, ?)";
        Object[][] towers = {
                { 19.0760, 72.8777, 100.0, 12, 20.0, "Strong" },
                { 19.0820, 72.8850, 95.0, 10, 20.0, "Strong" },
                { 19.0880, 72.8900, 50.0, 35, 15.0, "Medium" },
                { 19.0940, 72.8950, 48.0, 40, 15.0, "Medium" },
                { 19.1000, 72.9010, 15.0, 90, 10.0, "Weak" },
                { 19.1060, 72.9070, 98.0, 13, 20.0, "Strong" },
                { 19.1120, 72.9130, 52.0, 38, 15.0, "Medium" },
                { 19.1180, 72.9180, 16.0, 85, 10.0, "Weak" }
        };

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Object[] tower : towers) {
                ps.setDouble(1, (Double) tower[0]);
                ps.setDouble(2, (Double) tower[1]);
                ps.setDouble(3, (Double) tower[2]);
                ps.setInt(4, (Integer) tower[3]);
                ps.setDouble(5, (Double) tower[4]);
                ps.setString(6, (String) tower[5]);
                ps.executeUpdate();
            }
            System.out.println("[DB] " + towers.length + " tower records inserted.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // ── Seed USER_LOCATION TABLE (Roaming simulation data) ───────────────────
    private static void seedUserLocationIfAbsent() {
        if (hasData("user_location")) {
            System.out.println("[DB] User location data already seeded — skipping insert.");
            return;
        }

        Object[][] rows = {
                { 19.0760, 72.8777, "5G", 12 },
                { 19.0820, 72.8850, "5G", 10 },
                { 19.0880, 72.8900, "5G", 14 },
                { 19.0940, 72.8950, "5G", 11 },
                { 19.1000, 72.9010, "5G", 13 },
                { 19.1060, 72.9070, "4G", 45 },
                { 19.1120, 72.9130, "4G", 50 },
                { 19.1180, 72.9180, "4G", 48 },
                { 19.1240, 72.9240, "4G", 52 },
                { 19.1300, 72.9300, "5G", 15 },
                { 19.1360, 72.9360, "5G", 12 },
                { 19.1420, 72.9420, "5G", 10 },
                { 19.1480, 72.9480, "4G", 47 },
                { 19.1540, 72.9540, "4G", 55 },
                { 19.1600, 72.9600, "4G", 60 }
        };

        String sql = "INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Object[] row : rows) {
                ps.setDouble(1, (double) row[0]);
                ps.setDouble(2, (double) row[1]);
                ps.setString(3, (String) row[2]);
                ps.setInt(4, (int) row[3]);
                ps.executeUpdate();
            }
            System.out.println("[DB] " + rows.length + " user location records inserted.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // ── Helper to check if table has data ────────────────────────────────────
    private static boolean hasData(String tableName) {
        try (Connection conn = DBConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + tableName)) {

            if (rs.next()) {
                return rs.getInt(1) > 0;
            }

        } catch (SQLException e) {
            // Table doesn't exist yet
        }
        return false;
    }
}
