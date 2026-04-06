package com.telecom;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.nio.file.Paths;

public class DBConnection {

    // Stores TelecomDB folder next to wherever you run the app from
    private static final String DB_PATH = Paths.get("TelecomDB").toAbsolutePath().toString();
    private static final String DB_URL = "jdbc:derby:" + DB_PATH + ";create=true";

    static {
        try {
            System.err.println("[DEBUG] Attempting to load Derby driver...");
            Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
            System.err.println("[DEBUG] Derby driver loaded successfully");
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR] Failed to load Derby driver: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    public static void shutdown() {
        try {
            DriverManager.getConnection("jdbc:derby:;shutdown=true");
        } catch (SQLException e) {
            if (e.getSQLState().equals("XJ015")) {
                System.out.println("[DB] Derby shut down normally.");
            }
        }
    }
}
