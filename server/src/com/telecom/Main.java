package com.telecom;

import java.util.List;

public class Main {

    // ANSI colours
    static final String RESET = "\u001B[0m";
    static final String BOLD = "\u001B[1m";
    static final String GREEN = "\u001B[32m";
    static final String YELLOW = "\u001B[33m";
    static final String CYAN = "\u001B[36m";
    static final String RED = "\u001B[31m";
    static final String WHITE = "\u001B[37m";
    static final String BG_RED = "\u001B[41m";

    public static void main(String[] args) throws InterruptedException {

        printBanner();

        // ── First-run setup (safe to call every run — idempotent) ──────────
        DBSetup.createTableIfAbsent();
        DBSetup.seedDataIfAbsent();

        System.out.println();
        System.out.println(BOLD + CYAN + "  Starting roaming simulation..." + RESET);
        System.out.println(CYAN + "  ─────────────────────────────────────────────────" + RESET);
        System.out.println();

        // ── Fetch permanent data from DB ────────────────────────────────────
        LocationDAO dao = new LocationDAO();
        List<LocationPoint> locations = dao.fetchAll();

        if (locations.isEmpty()) {
            System.out.println(RED + "  No location data found in database." + RESET);
            DBConnection.shutdown();
            return;
        }

        System.out.println(CYAN + "  Total checkpoints loaded from DB: " + BOLD + locations.size() + RESET);
        System.out.println();

        // ── Simulate roaming ────────────────────────────────────────────────
        String previousSignal = null;

        for (LocationPoint point : locations) {

            // Detect 5G → 4G transition
            if ("5G".equals(previousSignal) && "4G".equals(point.getSignalType())) {
                printAlert();
            }

            printPoint(point);
            previousSignal = point.getSignalType();

            Thread.sleep(1500); // 1.5s delay between stops
        }

        System.out.println(CYAN + "  ─────────────────────────────────────────────────" + RESET);
        System.out.println(BOLD + GREEN + "  Simulation complete. User reached destination." + RESET);
        System.out.println();

        DBConnection.shutdown();
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    static void printBanner() {
        System.out.println(BOLD + CYAN);
        System.out.println("  ╔══════════════════════════════════════════════╗");
        System.out.println("  ║      TELECOM ROAMING SIGNAL TRACKER          ║");
        System.out.println("  ║         User Location Simulator              ║");
        System.out.println("  ╚══════════════════════════════════════════════╝");
        System.out.println(RESET);
    }

    static void printPoint(LocationPoint p) {
        boolean is5G = "5G".equals(p.getSignalType());
        String signalColor = is5G ? GREEN : YELLOW;
        String signalIcon = is5G ? "▲ 5G" : "▼ 4G";

        System.out.println(BOLD + "  [Stop #" + p.getId() + "]" + RESET);
        System.out.printf("   📍 Location : " + CYAN + "%.4f°N,  %.4f°E" + RESET + "%n",
                p.getLat(), p.getLang());
        System.out.println("   📶 Signal   : " + signalColor + BOLD + signalIcon + RESET);
        System.out.println("   ⏱  Latency  : " + latencyBar(p.getLatency()) + "  " + p.getLatency() + " ms");
        System.out.println();
    }

    static void printAlert() {
        System.out.println(BG_RED + WHITE + BOLD);
        System.out.println("  ╔══════════════════════════════════════════════════════════════╗");
        System.out.println("  ║  ⚠️  NETWORK ALERT                                            ║");
        System.out.println("  ║  You are now in a 4G zone!                                   ║");
        System.out.println("  ║  Please be mindful with your daily data limit.               ║");
        System.out.println("  ╚══════════════════════════════════════════════════════════════╝");
        System.out.println(RESET);
        System.out.println();
    }

    static String latencyBar(int latency) {
        int filled = Math.min(latency / 10, 10);
        String color = latency < 20 ? GREEN : (latency < 45 ? YELLOW : RED);
        return color + "█".repeat(filled) + "░".repeat(10 - filled) + RESET;
    }
}
