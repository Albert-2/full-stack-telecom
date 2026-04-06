# Telecom Network Monitoring System

## 📋 Overview

A complete console-based Java application that simulates a telecom network monitoring system with authentication, network logs tracking, tower information, and speed calculations. The system uses Apache Derby as an embedded database.

---

## ✨ Features

### Core Features

- **Dual Login System**: Guest and authenticated user modes
- **User Authentication**: Email/password validation with retry mechanism
- **Network Logs**: View recent network connectivity logs with signal strength
- **Tower Information**: List all nearby network towers with details
- **Speed Calculation**: Dynamic download/upload speed calculation based on signal strength
- **Database Persistence**: All data persists using Apache Derby
- **Colorful Console UI**: ANSI color-coded output for better readability

### System Architecture

- **Layered Architecture**: UI, Service, and DAO layers
- **JDBC with Prepared Statements**: Secure database operations
- **Idempotent Database Setup**: Safe to run multiple times
- **Model-Driven Design**: Separate classes for each entity (User, NetworkLog, Tower)

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id       INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
)
```

### Network Logs Table

```sql
CREATE TABLE network_logs (
    id               INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    latitude         DOUBLE NOT NULL,
    longitude        DOUBLE NOT NULL,
    signal_strength  VARCHAR(20) NOT NULL,
    signal_dbm       INT NOT NULL,
    timestamp        TIMESTAMP NOT NULL
)
```

### Towers Table

```sql
CREATE TABLE towers (
    id               INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    latitude         DOUBLE NOT NULL,
    longitude        DOUBLE NOT NULL,
    speed            DOUBLE NOT NULL,
    latency          INT NOT NULL,
    bandwidth        DOUBLE NOT NULL,
    signal_strength  VARCHAR(20) NOT NULL
)
```

### User Location Table (Roaming Simulation)

```sql
CREATE TABLE user_location (
    id          INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    lat         DOUBLE NOT NULL,
    lang        DOUBLE NOT NULL,
    signal_type VARCHAR(10) NOT NULL,
    latency     INT NOT NULL
)
```

---

## 📊 Sample Data

### Test Users

| Email          | Password    |
| -------------- | ----------- |
| user1@test.com | password123 |
| user2@test.com | password456 |
| user3@test.com | secure@pass |

### Sample Towers (8 towers with varying signal strengths)

- Tower 1-2: Strong signal (100 Mbps, 10-12 ms latency)
- Tower 3-4: Medium signal (48-52 Mbps, 35-40 ms latency)
- Tower 5,8: Weak signal (15-16 Mbps, 85-90 ms latency)
- Tower 6-7: Strong/Medium signals

### Sample Network Logs (6 logs)

Coordinates in Mumbai region with timestamps and signal strengths:

- Strong: -45 to -55 dBm
- Medium: -65 to -68 dBm
- Weak: -85 dBm

---

## 🚀 How to Run

### Prerequisites

- Java 11 or higher
- Maven/Gradle (optional, build scripts provided)
- Apache Derby JAR (included in `lib/` folder)

### Compilation & Execution

#### On Linux/Mac

```bash
cd server
./run.sh
```

#### On Windows

```cmd
cd server
run.bat
```

#### Manual Compilation & Execution

```bash
# Compile
javac -cp lib/derby-10.14.2.0.jar -d out src/com/telecom/*.java

# Run
java -cp out:lib/derby-10.14.2.0.jar com.telecom.TelecomApp
```

---

## 📱 Application Flow

### 1. **Main Menu**

```
╔════════════════════════════════════════╗
║   TELECOM NETWORK MONITORING SYSTEM    ║
╚════════════════════════════════════════╝

Choose an option:
  1. Login as Guest
  2. Login as User
  3. Exit
```

### 2. **Guest Flow**

- No authentication required
- View network logs immediately
- Displays last 20 network log entries with:
  - Log ID
  - Latitude/Longitude
  - Signal Strength
  - Signal DBM value
  - Timestamp

### 3. **User Authentication**

```
Enter Email: user1@test.com
Enter Password: ••••••••••
✓ Login successful!
```

**Features:**

- 3 login retry attempts
- Validates email and password format
- Secure credential checking

### 4. **User Dashboard**

After successful login, users access:

#### Option 1: View Network Logs

- Shows last 20 network logs
- Displays detailed information for each log
- Color-coded signal strength

#### Option 2: View Nearby Network Towers

- Lists all towers with details:
  - Tower ID
  - Location (Latitude, Longitude)
  - Connectivity Speed (Mbps)
  - Latency (ms)
  - Bandwidth (MHz)
  - Signal Strength category

#### Option 3: View Download & Upload Speed

- Calculates speeds based on tower signal strength:
  - **Strong Signal**: 50-100 Mbps download, 20-50 Mbps upload
  - **Medium Signal**: 20-50 Mbps download, 10-25 Mbps upload
  - **Weak Signal**: 5-15 Mbps download, 2-7 Mbps upload

#### Option 4: Logout

- Returns to main menu

---

## 📂 Project Structure

```
server/
├── src/com/telecom/
│   ├── DBConnection.java         # Database connection utility
│   ├── DBSetup.java              # Table creation and seeding
│   ├── TelecomApp.java           # Main console application
│   ├── User.java                 # User model
│   ├── NetworkLog.java           # Network log model
│   ├── Tower.java                # Tower model
│   ├── UserDAO.java              # User data access
│   ├── NetworkLogDAO.java        # Network log data access
│   ├── TowerDAO.java             # Tower data access
│   ├── AuthService.java          # Authentication service
│   ├── NetworkService.java       # Network operations service
│   ├── Main.java                 # Roaming simulation (alternative)
│   ├── ApiServer.java            # REST API server (optional)
│   ├── LocationDAO.java          # Location data access
│   └── LocationPoint.java        # Location model
├── lib/
│   └── derby-10.14.2.0.jar      # Apache Derby database JAR
├── out/                          # Compiled classes (auto-generated)
├── TelecomDB/                    # Derby database files (auto-generated)
├── run.sh                        # Linux/Mac run script
├── run.bat                       # Windows run script
└── README.md                     # This file
```

---

## 🏗️ Class Architecture

### Models (Data Classes)

- **User**: Represents a user with id, email, password
- **NetworkLog**: Represents a network log entry with location, signal, timestamp
- **Tower**: Represents a network tower with location, speed, latency, bandwidth

### Data Access Objects (DAO)

- **UserDAO**: Authenticates users, retrieves user data
- **NetworkLogDAO**: Fetches and inserts network logs
- **TowerDAO**: Fetches tower data and finds nearest tower

### Services (Business Logic)

- **AuthService**: Validates user credentials and email format
- **NetworkService**: Handles network operations, speed calculations

### UI & Controllers

- **TelecomApp**: Main console UI with login and dashboard menus

### Utilities

- **DBConnection**: JDBC connection pooling and Derby driver management
- **DBSetup**: Idempotent table creation and data seeding

---

## 🔐 Security Features

1. **Prepared Statements**: All SQL queries use prepared statements to prevent SQL injection
2. **Password Storage**: Passwords stored (in production, use hashing like bcrypt)
3. **Input Validation**: Email format and password requirements checked
4. **Retry Limit**: Login attempts limited to 3 before returning to main menu
5. **Connection Management**: Proper resource handling with try-with-resources

---

## 🎨 Console UI Features

- **ANSI Color Codes**: Different colors for different message types
- **Visual Separation**: Box drawing characters for menu organization
- **Emoji Icons**: Visual indicators (📍, 📶, 🗼, etc.)
- **Progress Indicators**: Clear status messages
- **Formatted Tables**: Structured data display

---

## 🔄 Signal Strength Categories

| Category   | Download Speed | Upload Speed | DBM Range  |
| ---------- | -------------- | ------------ | ---------- |
| **Strong** | 50-100 Mbps    | 20-50 Mbps   | -45 to -55 |
| **Medium** | 20-50 Mbps     | 10-25 Mbps   | -65 to -68 |
| **Weak**   | 5-15 Mbps      | 2-7 Mbps     | -85 to -95 |

---

## 🧪 Testing the Application

### Test Case 1: Guest Login

```
Select: 1
Expected: View network logs without authentication
```

### Test Case 2: User Login (Valid)

```
Select: 2
Email: user1@test.com
Password: password123
Expected: Access user dashboard
```

### Test Case 3: User Login (Invalid)

```
Select: 2
Email: user1@test.com
Password: wrongpassword
Expected: Error message, retry 3 times then return to menu
```

### Test Case 4: View Tower Information

```
Select: 2 → Login → 2
Expected: List all 8 towers with details
```

### Test Case 5: Speed Calculation

```
Select: 2 → Login → 3
Expected: Show download/upload speeds for each tower
```

---

## 🛠️ Troubleshooting

### Issue: "No suitable driver found"

**Solution**: Ensure `lib/derby-10.14.2.0.jar` is in the classpath:

```bash
java -cp out:lib/derby-10.14.2.0.jar com.telecom.TelecomApp
```

### Issue: "Table already exists"

**Solution**: This is normal. The DBSetup.java is idempotent and skips table creation if they already exist.

### Issue: "No network logs found"

**Solution**: Database is seeded on first run. If no data appears:

1. Delete the `TelecomDB/` folder
2. Run the application again
3. Database will be recreated with sample data

### Issue: Derby database locked

**Solution**: Close all Java instances and delete `TelecomDB/db.lck`:

```bash
rm TelecomDB/db.lck
```

---

## 📝 Alternative: Roaming Simulation

The system also includes a roaming simulation mode. To run it instead:

```bash
# Compile
javac -cp lib/derby-10.14.2.0.jar -d out src/com/telecom/*.java

# Run roaming simulation
java -cp out:lib/derby-10.14.2.0.jar com.telecom.Main
```

This will simulate a user traveling through different network zones with 5G↔4G transitions.

---

## 🚀 Future Enhancements

1. **Database**: Use MySQL/PostgreSQL instead of Derby
2. **Web Interface**: Convert to REST API with web dashboard
3. **Real Data**: Integrate with actual telecom provider APIs
4. **Analytics**: Add network statistics and trends
5. **Notifications**: Real-time alerts for network issues
6. **Mobile App**: Android/iOS companion app
7. **User Profiles**: Save user preferences and history
8. **Performance Monitoring**: Track network performance over time

---

## 📄 License

This project is provided as-is for educational and testing purposes.

---

## 📧 Support

For issues, questions, or suggestions, please refer to the INTEGRATION_GUIDE.md in the project root.
