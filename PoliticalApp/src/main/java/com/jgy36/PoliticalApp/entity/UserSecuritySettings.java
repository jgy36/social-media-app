package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_security_settings")
public class UserSecuritySettings {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private boolean twoFaEnabled;
    private String twoFaSecret;
    private LocalDateTime lastPasswordChange;

    // Getters, setters, etc.
}
