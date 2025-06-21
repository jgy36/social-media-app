package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Getter
@Entity
@Table(name = "user_privacy_settings")
public class UserPrivacySettings {
    // Getters and Setters
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

    // Constructors
    public UserPrivacySettings() {
    }

    public UserPrivacySettings(User user) {
        this.user = user;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPublicProfile(boolean publicProfile) {
        this.publicProfile = publicProfile;
    }

    public void setShowPoliticalAffiliation(boolean showPoliticalAffiliation) {
        this.showPoliticalAffiliation = showPoliticalAffiliation;
    }

    public void setShowPostHistory(boolean showPostHistory) {
        this.showPostHistory = showPostHistory;
    }

    public void setShowVotingRecord(boolean showVotingRecord) {
        this.showVotingRecord = showVotingRecord;
    }

    public void setAllowDirectMessages(boolean allowDirectMessages) {
        this.allowDirectMessages = allowDirectMessages;
    }

    public void setAllowFollowers(boolean allowFollowers) {
        this.allowFollowers = allowFollowers;
    }

    public void setAllowSearchIndexing(boolean allowSearchIndexing) {
        this.allowSearchIndexing = allowSearchIndexing;
    }

    public void setDataSharing(boolean dataSharing) {
        this.dataSharing = dataSharing;
    }
}
