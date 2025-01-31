package com.jgy36.PoliticalApp.dto;

public class RegisterRequest {

    private String username;
    private String email;
    private String password;

    // ✅ Default Constructor (Needed for JSON deserialization)
    public RegisterRequest() {
    }

    // ✅ Parameterized Constructor (Useful for testing & manual object creation)
    public RegisterRequest(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // ✅ Getters and Setters

    // Username
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Email Address
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
