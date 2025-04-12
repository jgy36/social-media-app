package com.jgy36.PoliticalApp.dto;

// DTO for privacy settings
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

    public boolean isPublicProfile() {
        return publicProfile;
    }

    public void setPublicProfile(boolean publicProfile) {
        this.publicProfile = publicProfile;
    }

    public boolean isShowPoliticalAffiliation() {
        return showPoliticalAffiliation;
    }

    public void setShowPoliticalAffiliation(boolean showPoliticalAffiliation) {
        this.showPoliticalAffiliation = showPoliticalAffiliation;
    }

    public boolean isShowPostHistory() {
        return showPostHistory;
    }

    public void setShowPostHistory(boolean showPostHistory) {
        this.showPostHistory = showPostHistory;
    }

    public boolean isShowVotingRecord() {
        return showVotingRecord;
    }

    public void setShowVotingRecord(boolean showVotingRecord) {
        this.showVotingRecord = showVotingRecord;
    }

    public boolean isAllowDirectMessages() {
        return allowDirectMessages;
    }

    public void setAllowDirectMessages(boolean allowDirectMessages) {
        this.allowDirectMessages = allowDirectMessages;
    }

    public boolean isAllowFollowers() {
        return allowFollowers;
    }

    public void setAllowFollowers(boolean allowFollowers) {
        this.allowFollowers = allowFollowers;
    }

    public boolean isAllowSearchIndexing() {
        return allowSearchIndexing;
    }

    public void setAllowSearchIndexing(boolean allowSearchIndexing) {
        this.allowSearchIndexing = allowSearchIndexing;
    }

    public boolean isDataSharing() {
        return dataSharing;
    }

    public void setDataSharing(boolean dataSharing) {
        this.dataSharing = dataSharing;
    }
}
