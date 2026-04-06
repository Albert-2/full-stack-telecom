#!/usr/bin/env bash
# Quick start guide for Telecom Monitoring System

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║   TELECOM NETWORK MONITORING SYSTEM - QUICK START GUIDE                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

1. COMPILE & RUN
───────────────────────────────────────────────────────────────────────────────

FROM Linux/Mac:
  $ cd server
  $ ./run.sh

FROM Windows:
  > cd server
  > run.bat

Manual Compilation:
  $ mvn clean compile (if using Maven)
  $ javac -cp lib/derby-10.14.2.0.jar -d out src/com/telecom/*.java
  $ java -cp out:lib/derby-10.14.2.0.jar com.telecom.TelecomApp

2. MAIN MENU OPTIONS
───────────────────────────────────────────────────────────────────────────────

  1. Login as Guest
     └─ Shows network logs without authentication
     └─ Displays 20 most recent log entries with signal details

  2. Login as User
     └─ Requires email/password (3 attempts)
     └─ Test credentials:
         - user1@test.com / password123
         - user2@test.com / password456
         - user3@test.com / secure@pass

  3. Exit
     └─ Gracefully shuts down the application

3. USER DASHBOARD (After Login)
───────────────────────────────────────────────────────────────────────────────

  1. View Network Logs
     ├─ Shows 20 most recent network logs
     ├─ Each log displays:
     │  ├─ Log ID
     │  ├─ Latitude/Longitude
     │  ├─ Signal Strength (Strong/Medium/Weak)
     │  ├─ Signal DBM value
     │  └─ Timestamp
     └─ Color-coded by signal strength

  2. View Nearby Network Towers
     ├─ Lists all 8 towers in the system
     ├─ Each tower displays:
     │  ├─ Tower ID
     │  ├─ Location (Lat, Long)
     │  ├─ Speed (Mbps)
     │  ├─ Latency (ms)
     │  ├─ Bandwidth (MHz)
     │  └─ Signal Strength
     └─ 8 sample towers with varying signal strengths

  3. View Download & Upload Speed
     ├─ Calculates speeds based on signal strength
     ├─ For each tower shows:
     │  ├─ Tower ID
     │  ├─ Download Speed (Mbps)
     │  └─ Upload Speed (Mbps)
     └─ Speed ranges:
         ├─ Strong: 50-100 Mbps down, 20-50 Mbps up
         ├─ Medium: 20-50 Mbps down, 10-25 Mbps up
         └─ Weak: 5-15 Mbps down, 2-7 Mbps up

  4. Logout
     └─ Returns to main menu

4. DATABASE & SAMPLE DATA
───────────────────────────────────────────────────────────────────────────────

Users Table (3 test users):
  ├─ user1@test.com / password123
  ├─ user2@test.com / password456
  └─ user3@test.com / secure@pass

Towers (8 sample towers):
  ├─ Tower 1-2: Strong signal, 95-100 Mbps, 10-12 ms latency
  ├─ Tower 3-4: Medium signal, 48-50 Mbps, 35-40 ms latency
  ├─ Tower 5,8: Weak signal, 15-16 Mbps, 85-90 ms latency
  └─ Tower 6-7: Strong/Medium signals

Network Logs (6 sample entries):
  ├─ Coordinates: Mumbai region (19.07-19.16 N, 72.87-72.92 E)
  ├─ Signal strengths: Strong/Medium/Weak
  ├─ DBM values: -45 to -85 dBm
  └─ Timestamps: Recent entries (last hour)

5. TROUBLESHOOTING
───────────────────────────────────────────────────────────────────────────────

Q: "No suitable driver found"
A: Ensure classpath includes Derby JAR:
   java -cp out:lib/derby-10.14.2.0.jar com.telecom.TelecomApp

Q: "Table already exists"
A: This is normal! DBSetup is idempotent (safe to run multiple times)

Q: "No network logs found"
A: Delete TelecomDB/ folder and rerun application

Q: Database locked error
A: Close all Java instances and delete TelecomDB/db.lck:
   rm TelecomDB/db.lck

6. PROJECT STRUCTURE
───────────────────────────────────────────────────────────────────────────────

server/
├── src/com/telecom/
│   ├── TelecomApp.java          ← Main console application
│   ├── User.java, NetworkLog.java, Tower.java (Models)
│   ├── UserDAO.java, NetworkLogDAO.java, TowerDAO.java (Data Access)
│   ├── AuthService.java, NetworkService.java (Business Logic)
│   ├── DBConnection.java, DBSetup.java (Database utilities)
│   ├── Main.java, ApiServer.java (Alternative/REST API)
│   └── LocationDAO.java, LocationPoint.java (Roaming simulation)
├── lib/
│   └── derby-10.14.2.0.jar
├── run.sh / run.bat            ← Compile and run scripts
└── README.md                   ← Full documentation

7. ADDITIONAL FEATURES
───────────────────────────────────────────────────────────────────────────────

✓ ANSI color-coded console output
✓ 3-attempt login retry mechanism
✓ Email format validation
✓ Prepared statements (SQL injection safe)
✓ Proper resource management (try-with-resources)
✓ Idempotent database setup
✓ Alternative roaming simulation mode

8. RUNNING ROAMING SIMULATION (Alternative)
───────────────────────────────────────────────────────────────────────────────

The system also includes a network roaming simulation that tracks a user
traveling through different signal zones with 5G↔4G transitions.

  $ java -cp out:lib/derby-10.14.2.0.jar com.telecom.Main

This shows location tracking with signal strength changes and alerts.

9. NEXT STEPS
───────────────────────────────────────────────────────────────────────────────

To extend the system:
  1. Add user profile/history tracking
  2. Integrate with REST API endpoints
  3. Add real-time network monitoring
  4. Create web dashboard (Angular)
  5. Add performance analytics
  6. Implement user preferences saving
  7. Add SMS/email notifications
  8. Connect to real telecom provider APIs

═════════════════════════════════════════════════════════════════════════════════

For detailed documentation, see README.md

EOF
