package com.jgy36.PoliticalApp.dto;

import lombok.Getter;

// DTO for privacy settings
@Getter
public class UserPrivacySettingsDto {
    private boolean publicProfile = true;
    private boolean showPoliticalAffiliation = false;
    private boolean showPostHistory = true;
    private boolean showVotingRecord = false;
    private boolean allowDirectMessages = true;
    private boolean allowFollowers = true;
    private boolean allowSearchIndexing = true;
    private boolean dataSharing = false;

    public UserPrivacySettingsDto() {
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

    // Helper method to check if account is private (inverted publicProfile)
    public boolean isPrivateAccount() {
        return !publicProfile;
    }
}
