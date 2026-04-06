package com.telecom;

/**
 * AuthService: Authentication business logic
 */
public class AuthService {
    private UserDAO userDAO;

    public AuthService() {
        this.userDAO = new UserDAO();
    }

    /**
     * Validate user credentials
     */
    public User validateUser(String email, String password) {
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return null;
        }
        return userDAO.authenticate(email, password);
    }

    /**
     * Check if email format is valid
     */
    public boolean isValidEmail(String email) {
        return email != null && email.contains("@") && email.contains(".");
    }

    /**
     * Register a new user
     * Returns: "success", "email_exists", or "invalid_email"
     */
    public String registerUser(String email, String password) {
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return "empty_fields";
        }

        if (!isValidEmail(email)) {
            return "invalid_email";
        }

        if (userDAO.emailExists(email)) {
            return "email_exists";
        }

        if (userDAO.registerUser(email, password)) {
            return "success";
        }

        return "error";
    }
}
