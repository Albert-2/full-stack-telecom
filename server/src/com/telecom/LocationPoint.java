package com.telecom;

public class LocationPoint {

    private int id;
    private double lat;
    private double lang;
    private String signalType;
    private int latency;

    public LocationPoint(int id, double lat, double lang, String signalType, int latency) {
        this.id         = id;
        this.lat        = lat;
        this.lang       = lang;
        this.signalType = signalType;
        this.latency    = latency;
    }

    public int    getId()          { return id; }
    public double getLat()         { return lat; }
    public double getLang()        { return lang; }
    public String getSignalType()  { return signalType; }
    public int    getLatency()     { return latency; }
}
