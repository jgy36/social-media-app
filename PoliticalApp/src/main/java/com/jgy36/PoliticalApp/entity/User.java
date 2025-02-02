package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
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

    @Enumerated(EnumType.STRING) // ✅ Store as STRING instead of plain text
    @Column(nullable = false)
    private Role role = Role.ROLE_USER; // ✅ Default to ROLE_USER

    @Column(nullable = false)
    private boolean verified = false;

    private String verificationToken;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
        this.verificationToken = UUID.randomUUID().toString();
    }

    public User(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.verified = false;
        this.verificationToken = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }
}
