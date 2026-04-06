package com.telecom;

import java.sql.Timestamp;
import java.util.List;
import java.util.Random;

/**
 * NetworkService: Business logic for network operations
 */
public class NetworkService {
    private NetworkLogDAO logDAO;
    private TowerDAO towerDAO;
    private Random random;

    public NetworkService() {
        this.logDAO = new NetworkLogDAO();
        this.towerDAO = new TowerDAO();
        this.random = new Random();
    }

    /**
     * Fetch all network logs
     */
    public List<NetworkLog> getAllNetworkLogs() {
        return logDAO.fetchAll();
    }

    /**
     * Generate random network logs for display
     */
    public void generateRandomLog() {
        double latitude = 19.0 + (random.nextDouble() * 0.2);
        double longitude = 72.8 + (random.nextDouble() * 0.2);
        String[] signals = { "Strong", "Medium", "Weak" };
        String signal = signals[random.nextInt(signals.length)];
        int dbm = -50 - random.nextInt(80);

        logDAO.insertLog(latitude, longitude, signal, dbm, new Timestamp(System.currentTimeMillis()));
    }

    /**
     * Calculate download speed based on signal strength
     */
    public double calculateDownloadSpeed(String signalStrength) {
        return switch (signalStrength.toLowerCase()) {
            case "strong" -> 50.0 + random.nextDouble() * 50; // 50-100 Mbps
            case "medium", "متوسط" -> 20.0 + random.nextDouble() * 30; // 20-50 Mbps
            case "weak" -> 5.0 + random.nextDouble() * 10; // 5-15 Mbps
            default -> 10.0;
        };
    }

    /**
     * Calculate upload speed based on signal strength
     */
    public double calculateUploadSpeed(String signalStrength) {
        return switch (signalStrength.toLowerCase()) {
            case "strong" -> 20.0 + random.nextDouble() * 30; // 20-50 Mbps
            case "medium", "متوسط" -> 10.0 + random.nextDouble() * 15; // 10-25 Mbps
            case "weak" -> 2.0 + random.nextDouble() * 5; // 2-7 Mbps
            default -> 5.0;
        };
    }

    /**
     * Get all towers
     */
    public List<Tower> getAllTowers() {
        return towerDAO.fetchAll();
    }

    /**
     * Find nearest tower
     */
    public Tower findNearestTower(double lat, double lng) {
        return towerDAO.findNearestTower(lat, lng);
    }
}
