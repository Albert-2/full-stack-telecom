package com.telecom;

import java.util.List;
import java.util.Scanner;

/**
 * TelecomApp: Main console application with login and dashboard
 */
public class TelecomApp {
    // ANSI colors
    private static final String RESET = "\u001B[0m";
    private static final String BOLD = "\u001B[1m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String CYAN = "\u001B[36m";
    private static final String RED = "\u001B[31m";
    private static final String MAGENTA = "\u001B[35m";

    private Scanner scanner;
    private AuthService authService;
    private NetworkService networkService;
    private User currentUser;

    public TelecomApp() {
        this.scanner = new Scanner(System.in);
        this.authService = new AuthService();
        this.networkService = new NetworkService();
    }

    public void run() {
        printBanner();
        System.out.flush();
        boolean running = true;

        while (running) {
            running = showLoginMenu();
            System.out.flush();
        }

        scanner.close();
        DBConnection.shutdown();
    }

    private boolean showLoginMenu() {
        System.out.println();
        System.out.println(BOLD + CYAN + "╔════════════════════════════════════════╗" + RESET);
        System.out.println(BOLD + CYAN + "║   TELECOM NETWORK MONITORING SYSTEM    ║" + RESET);
        System.out.println(BOLD + CYAN + "╚════════════════════════════════════════╝" + RESET);
        System.out.println();
        System.out.println(BOLD + "Choose an option:" + RESET);
        System.out.println(GREEN + "  1. " + RESET + "Login as Guest");
        System.out.println(GREEN + "  2. " + RESET + "Login as User");
        System.out.println(RED + "  3. " + RESET + "Exit");
        System.out.print(BOLD + "\n▶ Enter your choice (1-3): " + RESET);
        System.out.flush();

        String choice = scanner.nextLine().trim();

        switch (choice) {
            case "1":
                guestFlow();
                return true;
            case "2":
                userFlow();
                return true;
            case "3":
                System.out.println(YELLOW + "\n  👋 Thank you for using Telecom Network Monitoring System!" + RESET);
                return false;
            default:
                System.out.println(RED + "  ✗ Invalid choice. Please try again." + RESET);
                return true;
        }
    }

    private void guestFlow() {
        System.out.println();
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println(BOLD + GREEN + "  GUEST MODE - NETWORK LOGS" + RESET);
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println();

        displayNetworkLogs();
    }

    private void userFlow() {
        showRegisterOrLoginMenu();
    }

    private void showRegisterOrLoginMenu() {
        System.out.println();
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println(BOLD + MAGENTA + "  USER AUTHENTICATION" + RESET);
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println();
        System.out.println(GREEN + "  1. " + RESET + "Register (New User)");
        System.out.println(GREEN + "  2. " + RESET + "Login (Existing User)");
        System.out.println(RED + "  3. " + RESET + "Back to Main Menu");
        System.out.print(BOLD + "\\n▶ Enter your choice (1-3): " + RESET);
        System.out.flush();

        String choice = scanner.nextLine().trim();

        switch (choice) {
            case "1":
                registerFlow();
                break;
            case "2":
                loginFlow();
                break;
            case "3":
                System.out.println(YELLOW + "  Returning to main menu..." + RESET);
                break;
            default:
                System.out.println(RED + "  ✗ Invalid choice. Please try again." + RESET);
                showRegisterOrLoginMenu();
        }
    }

    private void registerFlow() {
        System.out.println();
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println(BOLD + GREEN + "  REGISTER NEW USER" + RESET);
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println();

        System.out.print(BOLD + "Email: " + RESET);
        String email = scanner.nextLine().trim();

        System.out.print(BOLD + "Password: " + RESET);
        String password = scanner.nextLine().trim();

        String result = authService.registerUser(email, password);

        switch (result) {
            case "empty_fields":
                System.out.println(RED + "  ✗ Email and password cannot be empty." + RESET);
                registerFlow();
                break;

            case "invalid_email":
                System.out.println(RED + "  ✗ Invalid email format. Please use format: user@example.com" + RESET);
                registerFlow();
                break;

            case "email_exists":
                System.out.println(RED + "  ✗ Email already registered. Please login or use a different email." + RESET);
                System.out.println();
                showRegisterOrLoginMenu();
                break;

            case "success":
                System.out.println(GREEN + "  ✓ Registration successful!" + RESET);
                System.out.println(YELLOW + "  Redirecting to login..." + RESET);
                System.out.println();
                loginFlow();
                break;

            case "error":
                System.out.println(RED + "  ✗ Registration failed. Please try again." + RESET);
                registerFlow();
                break;
        }
    }

    private void loginFlow() {
        System.out.println();
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println(BOLD + MAGENTA + "  USER LOGIN" + RESET);
        System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
        System.out.println();

        int retries = 3;
        while (retries > 0) {
            System.out.print(BOLD + "Email: " + RESET);
            String email = scanner.nextLine().trim();

            System.out.print(BOLD + "Password: " + RESET);
            String password = scanner.nextLine().trim();

            User user = authService.validateUser(email, password);
            if (user != null) {
                this.currentUser = user;
                System.out.println(GREEN + "  ✓ Login successful!" + RESET);
                userDashboard();
                return;
            } else {
                retries--;
                System.out.println(RED + "  ✗ Invalid credentials. (" + retries + " attempts left)" + RESET);
            }
        }
        System.out.println(RED + "  ✗ Too many failed attempts. Returning to main menu." + RESET);
    }

    private void userDashboard() {
        boolean inDashboard = true;

        while (inDashboard) {
            System.out.println();
            System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
            System.out.println(BOLD + GREEN + "  USER DASHBOARD" + RESET);
            System.out.println(BOLD + "  Welcome, " + currentUser.getEmail() + RESET);
            System.out.println(BOLD + CYAN + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + RESET);
            System.out.println();
            System.out.println(GREEN + "  1. " + RESET + "View Network Logs");
            System.out.println(GREEN + "  2. " + RESET + "View Nearby Network Towers");
            System.out.println(GREEN + "  3. " + RESET + "View Download & Upload Speed");
            System.out.println(RED + "  4. " + RESET + "Logout");
            System.out.print(BOLD + "\n▶ Enter your choice (1-4): " + RESET);

            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    displayNetworkLogs();
                    break;
                case "2":
                    displayNearbyTowers();
                    break;
                case "3":
                    displaySpeedInfo();
                    break;
                case "4":
                    System.out.println(YELLOW + "  👋 Logging out..." + RESET);
                    this.currentUser = null;
                    inDashboard = false;
                    break;
                default:
                    System.out.println(RED + "  ✗ Invalid choice. Please try again." + RESET);
            }
        }
    }

    private void displayNetworkLogs() {
        System.out.println();
        System.out.println(BOLD + CYAN + "  NETWORK LOGS (Last 20 entries)" + RESET);
        System.out.println(BOLD + CYAN + "  ────────────────────────────────────────────" + RESET);
        System.out.println();

        List<NetworkLog> logs = networkService.getAllNetworkLogs();

        if (logs.isEmpty()) {
            System.out.println(YELLOW + "  No network logs found." + RESET);
            return;
        }

        for (NetworkLog log : logs) {
            System.out.println(BOLD + "  📍 Log ID: " + RESET + log.getId());
            System.out.printf("     Latitude:  " + CYAN + "%.4f°N" + RESET + "%n", log.getLatitude());
            System.out.printf("     Longitude: " + CYAN + "%.4f°E" + RESET + "%n", log.getLongitude());
            System.out.println(
                    "     Signal:    " + signalColor(log.getSignalStrength()) + log.getSignalStrength() + RESET);
            System.out.println("     Signal DBM: " + YELLOW + log.getSignalDbm() + " dBm" + RESET);
            System.out.println("     Timestamp: " + MAGENTA + log.getTimestamp() + RESET);
            System.out.println();
        }
    }

    private void displayNearbyTowers() {
        System.out.println();
        System.out.println(BOLD + CYAN + "  NEARBY NETWORK TOWERS" + RESET);
        System.out.println(BOLD + CYAN + "  ────────────────────────────────────────────" + RESET);
        System.out.println();

        List<Tower> towers = networkService.getAllTowers();

        if (towers.isEmpty()) {
            System.out.println(YELLOW + "  No towers found." + RESET);
            return;
        }

        for (Tower tower : towers) {
            System.out.println(BOLD + "  🗼 Tower ID: " + RESET + tower.getId());
            System.out.printf("     Location:  " + CYAN + "%.4f°N, %.4f°E" + RESET + "%n",
                    tower.getLatitude(), tower.getLongitude());
            System.out.println("     Speed:     " + GREEN + String.format("%.2f Mbps", tower.getSpeed()) + RESET);
            System.out.println("     Latency:   " + YELLOW + tower.getLatency() + " ms" + RESET);
            System.out.println("     Bandwidth: " + MAGENTA + String.format("%.2f MHz", tower.getBandwidth()) + RESET);
            System.out.println(
                    "     Signal:    " + signalColor(tower.getSignalStrength()) + tower.getSignalStrength() + RESET);
            System.out.println();
        }
    }

    private void displaySpeedInfo() {
        System.out.println();
        System.out.println(BOLD + CYAN + "  DOWNLOAD & UPLOAD SPEED" + RESET);
        System.out.println(BOLD + CYAN + "  ────────────────────────────────────────────" + RESET);
        System.out.println();

        List<Tower> towers = networkService.getAllTowers();

        if (towers.isEmpty()) {
            System.out.println(YELLOW + "  No towers found." + RESET);
            return;
        }

        for (Tower tower : towers) {
            String signal = tower.getSignalStrength();
            double download = networkService.calculateDownloadSpeed(signal);
            double upload = networkService.calculateUploadSpeed(signal);

            System.out.println(BOLD + "  🗼 Tower " + tower.getId() + " (" + signal + " Signal)" + RESET);
            System.out.println("     Download: " + GREEN + String.format("%.2f Mbps", download) + RESET);
            System.out.println("     Upload:   " + GREEN + String.format("%.2f Mbps", upload) + RESET);
            System.out.println();
        }
    }

    private String signalColor(String signal) {
        return switch (signal.toLowerCase()) {
            case "strong" -> GREEN;
            case "medium", "متوسط" -> YELLOW;
            case "weak" -> RED;
            default -> CYAN;
        };
    }

    private void printBanner() {
        System.out.println();
        System.out.println(BOLD + CYAN);
        System.out.println("  ╔═════════════════════════════════════════════════════╗");
        System.out.println("  ║    TELECOM ROAMING & NETWORK MONITORING SYSTEM     ║");
        System.out.println("  ║            Advanced Location Simulator             ║");
        System.out.println("  ╚═════════════════════════════════════════════════════╝");
        System.out.println(RESET);
    }

    public static void main(String[] args) {
        // Initialize database
        DBSetup.createTableIfAbsent();
        DBSetup.seedDataIfAbsent();

        // Start application
        TelecomApp app = new TelecomApp();
        app.run();
    }
}
