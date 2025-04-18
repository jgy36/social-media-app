package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.dto.UserPrivacySettingsDto;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.entity.UserPrivacySettings;
import com.jgy36.PoliticalApp.repository.UserPrivacySettingsRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrivacySettingsService {
    private final UserPrivacySettingsRepository privacyRepository;
    private final UserRepository userRepository;

    public PrivacySettingsService(UserPrivacySettingsRepository privacyRepository, UserRepository userRepository) {
        this.privacyRepository = privacyRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get the current authenticated user's ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getId();
    }

    /**
     * Get the current authenticated user
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /**
     * Get privacy settings for a user
     * If settings don't exist, create default ones
     */
    @Transactional
    public UserPrivacySettings getSettings(Long userId) {
        return privacyRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                    UserPrivacySettings settings = new UserPrivacySettings(user);
                    return privacyRepository.save(settings);
                });
    }

    /**
     * Get privacy settings for a specific user object
     * If settings don't exist, create default ones
     */
    @Transactional
    public UserPrivacySettings getUserSettings(User user) {
        return privacyRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserPrivacySettings settings = new UserPrivacySettings(user);
                    return privacyRepository.save(settings);
                });
    }

    /**
     * Get current user's privacy settings
     */
    public UserPrivacySettings getCurrentUserSettings() {
        return getSettings(getCurrentUserId());
    }

    /**
     * Check if a user's account is private
     *
     * @param userId The user ID to check
     * @return true if the account is private (publicProfile = false), false otherwise
     */
    public boolean isAccountPrivate(Long userId) {
        UserPrivacySettings settings = getSettings(userId);
        boolean isPrivate = !settings.isPublicProfile();

        System.out.println("DEBUG - Privacy check for user ID " + userId);
        System.out.println("Is private account? " + isPrivate);
        System.out.println("Settings: publicProfile=" + settings.isPublicProfile());

        return isPrivate;
    }

    /**
     * Check if the current user's account is private
     *
     * @return true if the account is private (publicProfile = false), false otherwise
     */
    public boolean isCurrentAccountPrivate() {
        return isAccountPrivate(getCurrentUserId());
    }

    /**
     * Update settings for a user based on DTO
     */
    @Transactional
    public UserPrivacySettings updateSettings(Long userId, UserPrivacySettingsDto settingsDto) {
        UserPrivacySettings settings = getSettings(userId);

        // Track old privacy setting to detect changes
        boolean wasPrivate = !settings.isPublicProfile();
        boolean willBePrivate = !settingsDto.isPublicProfile();

        // Update fields from DTO
        settings.setPublicProfile(settingsDto.isPublicProfile());
        settings.setShowPoliticalAffiliation(settingsDto.isShowPoliticalAffiliation());
        settings.setShowPostHistory(settingsDto.isShowPostHistory());
        settings.setShowVotingRecord(settingsDto.isShowVotingRecord());
        settings.setAllowDirectMessages(settingsDto.isAllowDirectMessages());
        settings.setAllowFollowers(settingsDto.isAllowFollowers());

        // Enforce related settings for private accounts
        if (willBePrivate) {
            // Private accounts shouldn't be indexed in search
            settings.setAllowSearchIndexing(false);
        } else {
            // Public accounts can be indexed if the user wants
            settings.setAllowSearchIndexing(settingsDto.isAllowSearchIndexing());
        }

        settings.setDataSharing(settingsDto.isDataSharing());

        // Save settings
        UserPrivacySettings updatedSettings = privacyRepository.save(settings);

        // If account was public and is now private, we might need to
        // convert existing follows to requests, but we'll leave that
        // to the controller or another service

        return updatedSettings;
    }

    /**
     * Update current user's privacy settings
     */
    @Transactional
    public UserPrivacySettings updateCurrentUserSettings(UserPrivacySettingsDto settingsDto) {
        return updateSettings(getCurrentUserId(), settingsDto);
    }

    /**
     * Simplified method to toggle private account setting
     *
     * @return The updated settings
     */
    @Transactional
    public UserPrivacySettings togglePrivateAccount() {
        UserPrivacySettings settings = getCurrentUserSettings();
        UserPrivacySettingsDto dto = toDto(settings);

        // Toggle the private account setting (invert publicProfile)
        dto.setPublicProfile(!dto.isPublicProfile());

        // If making private, enforce other privacy settings
        if (!dto.isPublicProfile()) {
            dto.setAllowSearchIndexing(false);
        }

        return updateCurrentUserSettings(dto);
    }

    /**
     * Set whether an account is private
     *
     * @param userId    The user ID
     * @param isPrivate Whether the account should be private
     * @return The updated settings
     */
    @Transactional
    public UserPrivacySettings setAccountPrivacy(Long userId, boolean isPrivate) {
        UserPrivacySettings settings = getSettings(userId);
        UserPrivacySettingsDto dto = toDto(settings);

        // Set the private account setting (invert for publicProfile)
        dto.setPublicProfile(!isPrivate);

        // If making private, enforce other privacy settings
        if (isPrivate) {
            dto.setAllowSearchIndexing(false);
        }

        return updateSettings(userId, dto);
    }

    /**
     * Reset settings to default values
     */
    @Transactional
    public UserPrivacySettings resetSettings(Long userId) {
        UserPrivacySettings settings = getSettings(userId);

        // Reset to default values
        settings.setPublicProfile(true); // Not private by default
        settings.setShowPoliticalAffiliation(false);
        settings.setShowPostHistory(true);
        settings.setShowVotingRecord(false);
        settings.setAllowDirectMessages(true);
        settings.setAllowFollowers(true);
        settings.setAllowSearchIndexing(true);
        settings.setDataSharing(false);

        return privacyRepository.save(settings);
    }

    /**
     * Reset current user's settings to default values
     */
    @Transactional
    public UserPrivacySettings resetCurrentUserSettings() {
        return resetSettings(getCurrentUserId());
    }

    /**
     * Convert entity to DTO
     */
    public UserPrivacySettingsDto toDto(UserPrivacySettings settings) {
        UserPrivacySettingsDto dto = new UserPrivacySettingsDto();
        dto.setPublicProfile(settings.isPublicProfile());
        dto.setShowPoliticalAffiliation(settings.isShowPoliticalAffiliation());
        dto.setShowPostHistory(settings.isShowPostHistory());
        dto.setShowVotingRecord(settings.isShowVotingRecord());
        dto.setAllowDirectMessages(settings.isAllowDirectMessages());
        dto.setAllowFollowers(settings.isAllowFollowers());
        dto.setAllowSearchIndexing(settings.isAllowSearchIndexing());
        dto.setDataSharing(settings.isDataSharing());
        return dto;
    }

    /**
     * Get a simplified privacy setting DTO that only shows if the account is private
     */
    public UserPrivacySettingsDto getSimplifiedSettings(Long userId) {
        UserPrivacySettings settings = getSettings(userId);
        UserPrivacySettingsDto dto = new UserPrivacySettingsDto();
        dto.setPublicProfile(settings.isPublicProfile());
        return dto;
    }
}
