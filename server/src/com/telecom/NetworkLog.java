package com.telecom;

import java.sql.Timestamp;

public class NetworkLog {
    private int id;
    private double latitude;
    private double longitude;
    private String signalStrength;
    private int signalDbm;
    private Timestamp timestamp;

    public NetworkLog(int id, double latitude, double longitude,
            String signalStrength, int signalDbm, Timestamp timestamp) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.signalStrength = signalStrength;
        this.signalDbm = signalDbm;
        this.timestamp = timestamp;
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

    public String getSignalStrength() {
        return signalStrength;
    }

    public int getSignalDbm() {
        return signalDbm;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }
}
