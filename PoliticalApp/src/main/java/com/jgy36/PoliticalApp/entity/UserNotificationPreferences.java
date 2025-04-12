package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;

@Entity
@Table(name = "user_notification_preferences")
public class UserNotificationPreferences {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private boolean emailNotifications = true;
    private boolean newCommentNotifications = true;
    private boolean mentionNotifications = true;
    private boolean politicalUpdates = false;
    private boolean communityUpdates = true;
    private boolean directMessageNotifications = true;
    private boolean followNotifications = true;
    private boolean likeNotifications = true;

    // Getters, setters, etc.
}
