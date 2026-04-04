package com.telecom;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LocationDAO {

    public List<LocationPoint> fetchAll() {
        List<LocationPoint> points = new ArrayList<>();
        String sql = "SELECT * FROM user_location ORDER BY id ASC";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt  = conn.createStatement();
             ResultSet rs    = stmt.executeQuery(sql)) {

            while (rs.next()) {
                points.add(new LocationPoint(
                    rs.getInt("id"),
                    rs.getDouble("lat"),
                    rs.getDouble("lang"),
                    rs.getString("signal_type"),
                    rs.getInt("latency")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return points;
    }
}
