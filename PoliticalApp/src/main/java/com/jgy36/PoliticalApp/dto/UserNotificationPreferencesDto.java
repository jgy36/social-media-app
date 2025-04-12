package com.jgy36.PoliticalApp.dto;

// DTO for notification preferences
public class UserNotificationPreferencesDto {
    private boolean emailNotifications = true;
    private boolean newCommentNotifications = true;
    private boolean mentionNotifications = true;
    private boolean politicalUpdates = false;
    private boolean communityUpdates = true;
    private boolean directMessageNotifications = true;
    private boolean followNotifications = true;
    private boolean likeNotifications = true;

    public UserNotificationPreferencesDto() {
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isNewCommentNotifications() {
        return newCommentNotifications;
    }

    public void setNewCommentNotifications(boolean newCommentNotifications) {
        this.newCommentNotifications = newCommentNotifications;
    }

    public boolean isMentionNotifications() {
        return mentionNotifications;
    }

    public void setMentionNotifications(boolean mentionNotifications) {
        this.mentionNotifications = mentionNotifications;
    }

    public boolean isPoliticalUpdates() {
        return politicalUpdates;
    }

    public void setPoliticalUpdates(boolean politicalUpdates) {
        this.politicalUpdates = politicalUpdates;
    }

    public boolean isCommunityUpdates() {
        return communityUpdates;
    }

    public void setCommunityUpdates(boolean communityUpdates) {
        this.communityUpdates = communityUpdates;
    }

    public boolean isDirectMessageNotifications() {
        return directMessageNotifications;
    }

    public void setDirectMessageNotifications(boolean directMessageNotifications) {
        this.directMessageNotifications = directMessageNotifications;
    }

    public boolean isFollowNotifications() {
        return followNotifications;
    }

    public void setFollowNotifications(boolean followNotifications) {
        this.followNotifications = followNotifications;
    }

    public boolean isLikeNotifications() {
        return likeNotifications;
    }

    public void setLikeNotifications(boolean likeNotifications) {
        this.likeNotifications = likeNotifications;
    }
}
