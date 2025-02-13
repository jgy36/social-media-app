package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // Notification belongs to a user
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String message; // Example: "JohnDoe replied to your comment."

    private boolean read = false; // Default: unread

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
