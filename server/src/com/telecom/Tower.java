package com.telecom;

public class Tower {
    private int id;
    private double latitude;
    private double longitude;
    private double speed;
    private int latency;
    private double bandwidth;
    private String signalStrength;

    public Tower(int id, double latitude, double longitude, double speed,
            int latency, double bandwidth, String signalStrength) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.latency = latency;
        this.bandwidth = bandwidth;
        this.signalStrength = signalStrength;
    }

    public int getId() {
        return id;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getSpeed() {
        return speed;
    }

    public int getLatency() {
        return latency;
    }

    public double getBandwidth() {
        return bandwidth;
    }

    public String getSignalStrength() {
        return signalStrength;
    }
}
