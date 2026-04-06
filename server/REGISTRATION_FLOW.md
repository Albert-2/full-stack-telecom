# 🔐 New Registration & Login Flow

## Updated Application Flow

### Main Menu (Unchanged)
```
╔════════════════════════════════════════╗
║   TELECOM NETWORK MONITORING SYSTEM    ║
╚════════════════════════════════════════╝

Choose an option:
  1. Login as Guest
  2. Login as User
  3. Exit
```

---

## NEW: User Authentication Menu (After selecting option 2)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER AUTHENTICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Register (New User)
  2. Login (Existing User)
  3. Back to Main Menu

▶ Enter your choice (1-3):
```

---

## Flow 1: Register (New User)

**If user selects option 1:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  REGISTER NEW USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: newuser@test.com
Password: mypassword123
```

### Validation Rules:
- ✓ Email must not be empty
- ✓ Password must not be empty
- ✓ Email must be valid format (contain @ and .)
- ✓ Email must NOT already exist in database

### Response Messages:

**Success:**
```
✓ Registration successful!
Redirecting to login...
```
→ Automatically redirects to login flow

**Email already exists:**
```
✗ Email already registered. Please login or use a different email.
```
→ Returns to User Authentication Menu (option to try different email or login)

**Invalid email format:**
```
✗ Invalid email format. Please use format: user@example.com
```
→ Re-prompts for registration

**Empty fields:**
```
✗ Email and password cannot be empty.
```
→ Re-prompts for registration

**Database error:**
```
✗ Registration failed. Please try again.
```
→ Re-prompts for registration

---

## Flow 2: Login (Existing User)

**If user selects option 2:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USER LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email: user1@test.com
Password: password123
```

### Features:
- ✓ 3 retry attempts (same as before)
- ✓ Shows remaining attempts after each failed login
- ✓ After successful login → User Dashboard

### Response Messages:

**Success:**
```
✓ Login successful!
```
→ Enters User Dashboard with 4 options

**Invalid credentials (1st attempt):**
```
✗ Invalid credentials. (2 attempts left)
```

**Invalid credentials (2nd attempt):**
```
✗ Invalid credentials. (1 attempts left)
```

**Invalid credentials (3rd attempt):**
```
✗ Invalid credentials. (0 attempts left)
✗ Too many failed attempts. Returning to main menu.
```
→ Returns to Main Menu

---

## Test Accounts

**Pre-existing test users:**
- `user1@test.com` / `password123`
- `user2@test.com` / `password456`
- `user3@test.com` / `secure@pass`

**Create new account:**
- Register with any email and password meeting validation requirements

---

## Code Changes Summary

### Modified Files:

1. **AuthService.java** - Added:
   - `registerUser(email, password)` - Validates and registers new users
   - Returns: "success", "email_exists", "invalid_email", "empty_fields", or "error"

2. **UserDAO.java** - Added:
   - `emailExists(email)` - Checks if email already registered
   - `registerUser(email, password)` - Inserts new user into database

3. **TelecomApp.java** - Added:
   - `showRegisterOrLoginMenu()` - Menu to choose register or login
   - `registerFlow()` - Handles user registration with validation
   - `loginFlow()` - Handles user login (extracted from original userFlow)
   - Modified `userFlow()` - Now calls showRegisterOrLoginMenu()

---

## User Experience Flow

```
START
  ↓
Main Menu (1=Guest, 2=User, 3=Exit)
  ↓ [Select 2]
User Authentication Menu (1=Register, 2=Login, 3=Back)
  ├─→ [Select 1: Register]
  │    ↓
  │    Enter Email & Password
  │    ↓
  │    Validate → [Email exists?] → [Yes] → Show error → Back to Auth Menu
  │    ↓                                [No]
  │    Register successful → Redirect to Login
  │
  └─→ [Select 2: Login]
       ↓
       Enter Email & Password (up to 3 attempts)
       ↓
       [Valid?] → [No] → Retry or fail
       ↓ [Yes]
       User Dashboard (4 options)
```

---

## How to Run

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

## ✅ What's New

| Feature | Before | After |
|---------|--------|-------|
| User entry point | Direct login | Auth menu (Register/Login) |
| Registration | Not available | ✅ Available |
| Email validation | On login | On register + login |
| Duplicate email check | Not available | ✅ Available |
| User feedback | Basic | ✅ Comprehensive error messages |
| Auto-redirect | No | ✅ After registration → Login |

---
