package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;

@Entity
@Table(name = "user_privacy_settings")
public class UserPrivacySettings {
    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private boolean publicProfile = true;
    private boolean showPoliticalAffiliation = false;
    private boolean showPostHistory = true;
    private boolean showVotingRecord = false;
    private boolean allowDirectMessages = true;
    private boolean allowFollowers = true;
    private boolean allowSearchIndexing = true;
    private boolean dataSharing = false;

    // Getters, setters, etc.
}
