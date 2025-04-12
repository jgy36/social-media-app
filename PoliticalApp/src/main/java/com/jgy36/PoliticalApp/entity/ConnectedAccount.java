package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "connected_accounts")
public class ConnectedAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String provider;
    private String providerUserId;
    private String accessToken;
    private String refreshToken;
    private LocalDateTime expiresAt;

    // Getters, setters, etc.
}
