package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "USER"; // Default role is "USER"

    @Column(nullable = false)
    private boolean verified = false; // Default: false (User needs to verify email)

    private String verificationToken; // Token for email verification

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // Auto-assign creation timestamp

    // ✅ Default Constructor
    public User() {
        this.verificationToken = UUID.randomUUID().toString(); // Generate token on creation
    }

    // ✅ Parameterized Constructor (Useful for manual user creation)
    public User(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.verified = false;
        this.verificationToken = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getters and Setters

    // Unique ID (Primary Key)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Username (Must be unique)
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Email Address (Must be unique)
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Password (Stored as a hashed value)
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // User Role (USER or ADMIN)
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // Account Verification Status (true = verified, false = not verified)
    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    // Email Verification Token (Generated on registration)
    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    // Account Creation Timestamp
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
