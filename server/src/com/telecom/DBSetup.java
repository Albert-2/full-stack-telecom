package com.telecom;

import java.sql.*;

/**
 * DBSetup runs ONCE on first launch.
 * On every subsequent run it detects the table/data already exist and skips.
 * The TelecomDB folder on disk is the permanent store.
 */
public class DBSetup {

    // ── 1. Create table (skips if already exists) ─────────────────────────
    public static void createTableIfAbsent() {
        String sql = """
                CREATE TABLE user_location (
                    id          INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    lat         DOUBLE       NOT NULL,
                    lang        DOUBLE       NOT NULL,
                    signal_type VARCHAR(10)  NOT NULL,
                    latency     INT          NOT NULL
                )
                """;
        try (Connection conn = DBConnection.getConnection();
             Statement stmt  = conn.createStatement()) {

            stmt.executeUpdate(sql);
            System.out.println("[DB] Table 'user_location' created for the first time.");

        } catch (SQLException e) {
            if ("X0Y32".equals(e.getSQLState())) {
                System.out.println("[DB] Table already exists — using existing data.");
            } else {
                e.printStackTrace();
            }
        }
    }

    // ── 2. Seed data (skips if rows already present) ──────────────────────
    public static void seedDataIfAbsent() {

        // Check row count first
        try (Connection conn = DBConnection.getConnection();
             Statement stmt  = conn.createStatement();
             ResultSet rs    = stmt.executeQuery("SELECT COUNT(*) FROM user_location")) {

            if (rs.next() && rs.getInt(1) > 0) {
                System.out.println("[DB] Data already seeded — skipping insert.");
                return;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return;
        }

        // Dummy route: Mumbai coordinates moving north
        // Two 5G→4G transitions are included to trigger alerts
        Object[][] rows = {
            //  lat        lang       signal  latency(ms)
            { 19.0760,  72.8777,  "5G",  12 },   // Stop 1  – Andheri (5G)
            { 19.0820,  72.8850,  "5G",  10 },   // Stop 2
            { 19.0880,  72.8900,  "5G",  14 },   // Stop 3
            { 19.0940,  72.8950,  "5G",  11 },   // Stop 4
            { 19.1000,  72.9010,  "5G",  13 },   // Stop 5
            { 19.1060,  72.9070,  "4G",  45 },   // Stop 6  – ⚠ 5G→4G ALERT
            { 19.1120,  72.9130,  "4G",  50 },   // Stop 7
            { 19.1180,  72.9180,  "4G",  48 },   // Stop 8
            { 19.1240,  72.9240,  "4G",  52 },   // Stop 9
            { 19.1300,  72.9300,  "5G",  15 },   // Stop 10 – back to 5G
            { 19.1360,  72.9360,  "5G",  12 },   // Stop 11
            { 19.1420,  72.9420,  "5G",  10 },   // Stop 12
            { 19.1480,  72.9480,  "4G",  47 },   // Stop 13 – ⚠ 5G→4G ALERT
            { 19.1540,  72.9540,  "4G",  55 },   // Stop 14
            { 19.1600,  72.9600,  "4G",  60 },   // Stop 15
        };

        String sql = "INSERT INTO user_location (lat, lang, signal_type, latency) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            for (Object[] row : rows) {
                ps.setDouble(1, (double) row[0]);
                ps.setDouble(2, (double) row[1]);
                ps.setString(3, (String) row[2]);
                ps.setInt(4,    (int)    row[3]);
                ps.executeUpdate();
            }
            System.out.println("[DB] " + rows.length + " location records saved permanently.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
