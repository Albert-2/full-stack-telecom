# 🧪 Registration & Login Flow - Test Guide

## How to Test the New Feature

### Step 1: Start the Application

**Linux/Mac:**
```bash
cd server
./run.sh
```

**Windows:**
```cmd
cd server
run.bat
```

**Or manually:**
```bash
java -cp out;lib/derby-10.14.2.0.jar com.telecom.TelecomApp
```

---

## Test Scenario 1: Register New User ✅

### Expected Console Output:

```
╔════════════════════════════════════════╗
║   TELECOM NETWORK MONITORING SYSTEM    ║
╚════════════════════════════════════════╝

Choose an option:
  1. Login as Guest
  2. Login as User
  3. Exit

▶ Enter your choice (1-3): 2
```

### Input: `2`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER AUTHENTICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Register (New User)
  2. Login (Existing User)
  3. Back to Main Menu

▶ Enter your choice (1-3): 1
```

### Input: `1`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  REGISTER NEW USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: testuser@example.com
Password: myPassword123
```

### Expected Success Output:

```
✓ Registration successful!
Redirecting to login...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: testuser@example.com
Password: myPassword123

✓ Login successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER DASHBOARD
  Welcome, testuser@example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. View Network Logs
  2. View Nearby Network Towers
  3. View Download & Upload Speed
  4. Logout
```

---

## Test Scenario 2: Email Already Exists ❌

### At Registration Prompt:

```
Email: user1@test.com
Password: anypassword
```

### Expected Error Output:

```
✗ Email already registered. Please login or use a different email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER AUTHENTICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Register (New User)
  2. Login (Existing User)
  3. Back to Main Menu

▶ Enter your choice (1-3):
```

✅ **Note**: Returns to auth menu, allows user to choose Login or Back

---

## Test Scenario 3: Invalid Email Format ❌

### At Registration Prompt:

```
Email: notanemail
Password: password123
```

### Expected Error Output:

```
✗ Invalid email format. Please use format: user@example.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  REGISTER NEW USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email:
```

✅ **Note**: Re-prompts for registration with correct format

---

## Test Scenario 4: Empty Fields ❌

### At Registration Prompt:

```
Email:
Password:
```

### Expected Error Output:

```
✗ Email and password cannot be empty.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  REGISTER NEW USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email:
```

✅ **Note**: Re-prompts for registration

---

## Test Scenario 5: Login with Existing User ✅

### At Auth Menu:

```
▶ Enter your choice (1-3): 2
```

### Login Prompt:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: user1@test.com
Password: password123

✓ Login successful!
[User Dashboard shown]
```

---

## Test Scenario 6: Login Failed - Wrong Password ❌

### At Login Prompt:

```
Email: user1@test.com
Password: wrongpassword

✗ Invalid credentials. (2 attempts left)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email:
```

✅ **Features**:
- Shows remaining attempts
- Re-prompts for login
- After 3 failed attempts → Returns to Main Menu

---

## Pre-existing Test Accounts

Use these to test login without registering:

| Email | Password | Status |
|-------|----------|--------|
| user1@test.com | password123 | ✅ Works |
| user2@test.com | password456 | ✅ Works |
| user3@test.com | secure@pass | ✅ Works |

---

## Test Checklist

- [ ] Can see "User Authentication" menu after selecting option 2
- [ ] Can register new user with valid email
- [ ] Registration rejects duplicate email
- [ ] Registration rejects invalid email format
- [ ] Registration rejects empty fields
- [ ] Registration auto-redirects to login on success
- [ ] Can login with newly registered user
- [ ] Can login with pre-existing test user
- [ ] Login shows retry count (3, 2, 1)
- [ ] Login rejects invalid credentials
- [ ] After 3 failed attempts, returns to Main Menu
- [ ] Successful login shows User Dashboard

---

## Database Verification

After registration, you can verify the user was saved by:

1. **Check database directly** (if using Derby tools):
   ```sql
   SELECT * FROM users;
   ```

2. **Try logging in** with the registered email/password

3. **Delete TelecomDB folder** if you need a fresh start:
   ```bash
   rm -rf TelecomDB  # Linux/Mac
   rmdir /s TelecomDB  # Windows
   ```
   Then re-run the application to reset to initial state.

---

## ✅ Summary

The application now has a complete user registration and login system:

✅ **Before entering dashboard, user can:**
- Register new account (with email & password)
- Login with existing account
- Return to main menu

✅ **Validation includes:**
- Email format checking
- Duplicate email detection
- Empty field validation
- Login retry limit (3 attempts)

✅ **User experience improvements:**
- Clear error messages
- Auto-redirect from registration to login
- Retry counts shown
- Organized menu structure

---
