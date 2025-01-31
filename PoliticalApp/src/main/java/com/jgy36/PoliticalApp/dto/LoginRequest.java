package com.jgy36.PoliticalApp.dto;

public class LoginRequest {

    private String email;
    private String password;

    // ✅ Default Constructor (Needed for JSON deserialization)
    public LoginRequest() {
    }

    // ✅ Parameterized Constructor (Useful for testing & manual object creation)
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // ✅ Getters and Setters

    // Email Address (Used for login instead of username)
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Password
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
