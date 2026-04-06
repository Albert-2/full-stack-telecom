package com.telecom;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * NetworkLogDAO: Data Access Object for network logs
 */
public class NetworkLogDAO {

    /**
     * Fetch all network logs (Derby uses FETCH FIRST instead of LIMIT)
     */
    public List<NetworkLog> fetchAll() {
        List<NetworkLog> logs = new ArrayList<>();
        String sql = "SELECT id, latitude, longitude, signal_strength, signal_dbm, timestamp" +
                " FROM network_logs ORDER BY timestamp DESC FETCH FIRST 20 ROWS ONLY";

        try (Connection conn = DBConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                logs.add(new NetworkLog(
                        rs.getInt("id"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getString("signal_strength"),
                        rs.getInt("signal_dbm"),
                        rs.getTimestamp("timestamp")));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return logs;
    }

    /**
     * Insert a network log record
     */
    public boolean insertLog(double latitude, double longitude, String signalStrength,
            int signalDbm, Timestamp timestamp) {
        String sql = "INSERT INTO network_logs (latitude, longitude, signal_strength, signal_dbm, timestamp)" +
                " VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setDouble(1, latitude);
            ps.setDouble(2, longitude);
            ps.setString(3, signalStrength);
            ps.setInt(4, signalDbm);
            ps.setTimestamp(5, timestamp);
            ps.executeUpdate();
            return true;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
