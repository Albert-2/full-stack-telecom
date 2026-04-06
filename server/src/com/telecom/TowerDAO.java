package com.telecom;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * TowerDAO: Data Access Object for network towers
 */
public class TowerDAO {

    /**
     * Fetch all towers
     */
    public List<Tower> fetchAll() {
        List<Tower> towers = new ArrayList<>();
        String sql = "SELECT id, latitude, longitude, speed, latency, bandwidth, signal_strength" +
                " FROM towers ORDER BY id ASC";

        try (Connection conn = DBConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                towers.add(new Tower(
                        rs.getInt("id"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getDouble("speed"),
                        rs.getInt("latency"),
                        rs.getDouble("bandwidth"),
                        rs.getString("signal_strength")));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return towers;
    }

    /**
     * Find nearest tower by coordinates (Derby uses FETCH FIRST instead of LIMIT)
     */
    public Tower findNearestTower(double userLat, double userLong) {
        String sql = "SELECT id, latitude, longitude, speed, latency, bandwidth, signal_strength" +
                " FROM towers ORDER BY SQRT(POWER(latitude - ?, 2) + POWER(longitude - ?, 2)) FETCH FIRST 1 ROWS ONLY";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setDouble(1, userLat);
            ps.setDouble(2, userLong);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new Tower(
                        rs.getInt("id"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude"),
                        rs.getDouble("speed"),
                        rs.getInt("latency"),
                        rs.getDouble("bandwidth"),
                        rs.getString("signal_strength"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
