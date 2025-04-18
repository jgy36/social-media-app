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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PrivacySettingsService {
    // Add a formatter for timestamps in logs
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private final UserPrivacySettingsRepository privacyRepository;
    private final UserRepository userRepository;

    public PrivacySettingsService(UserPrivacySettingsRepository privacyRepository, UserRepository userRepository) {
        this.privacyRepository = privacyRepository;
        this.userRepository = userRepository;
        logInfo("PrivacySettingsService initialized");
    }

    /**
     * Helper method to format and print log messages
     */
    private void logInfo(String message) {
        String timestamp = LocalDateTime.now().format(formatter);
        System.out.println("[PRIVACY-SERVICE " + timestamp + "] " + message);
    }

    /**
     * Helper method to format and print error messages
     */
    private void logError(String message, Throwable e) {
        String timestamp = LocalDateTime.now().format(formatter);
        System.err.println("[PRIVACY-SERVICE ERROR " + timestamp + "] " + message);
        if (e != null) {
            e.printStackTrace();
        }
    }

    /**
     * Get the current authenticated user's ID
     */
    private Long getCurrentUserId() {
        logInfo("Getting current user ID from authentication context");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logInfo("Auth email: " + email);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            logInfo("Current user ID: " + user.getId() + ", username: " + user.getUsername());
            return user.getId();
        } catch (Exception e) {
            logError("Failed to get current user ID", e);
            throw e;
        }
    }

    /**
     * Get the current authenticated user
     */
    public User getCurrentUser() {
        logInfo("Getting current user from authentication context");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            logInfo("Auth email: " + email);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            logInfo("Found current user: ID=" + user.getId() + ", username=" + user.getUsername());
            return user;
        } catch (Exception e) {
            logError("Failed to get current user", e);
            throw e;
        }
    }

    /**
     * Get privacy settings for a user
     * If settings don't exist, create default ones
     */
    @Transactional
    public UserPrivacySettings getSettings(Long userId) {
        logInfo("=== GET PRIVACY SETTINGS [userId=" + userId + "] ===");
        try {
            // Check if settings exist
            logInfo("Checking if privacy settings exist for user " + userId);
            var settingsOpt = privacyRepository.findByUserId(userId);

            if (settingsOpt.isPresent()) {
                UserPrivacySettings settings = settingsOpt.get();
                logInfo("Found existing settings: publicProfile=" + settings.isPublicProfile() +
                        ", allowFollowers=" + settings.isAllowFollowers() +
                        ", allowSearchIndexing=" + settings.isAllowSearchIndexing());
                return settings;
            } else {
                // Create new settings
                logInfo("No settings found, creating default settings");
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> {
                            logError("User not found with ID: " + userId, null);
                            return new UsernameNotFoundException("User not found with ID: " + userId);
                        });

                UserPrivacySettings settings = new UserPrivacySettings(user);
                logInfo("Created default settings: publicProfile=" + settings.isPublicProfile() +
                        ", allowFollowers=" + settings.isAllowFollowers() +
                        ", allowSearchIndexing=" + settings.isAllowSearchIndexing());

                UserPrivacySettings savedSettings = privacyRepository.save(settings);
                logInfo("Saved default settings with ID: " + savedSettings.getUserId());
                return savedSettings;
            }
        } catch (Exception e) {
            logError("Error getting privacy settings for user " + userId, e);
            throw e;
        } finally {
            logInfo("=== END GET PRIVACY SETTINGS ===");
        }
    }

    /**
     * Get privacy settings for a specific user object
     * If settings don't exist, create default ones
     */
    @Transactional
    public UserPrivacySettings getUserSettings(User user) {
        if (user == null) {
            logError("getUserSettings called with null user", null);
            throw new IllegalArgumentException("User cannot be null");
        }

        logInfo("=== GET USER SETTINGS [username=" + user.getUsername() + ", id=" + user.getId() + "] ===");
        try {
            // Always get fresh settings from the database
            var settingsOpt = privacyRepository.findByUserId(user.getId());

            if (settingsOpt.isPresent()) {
                UserPrivacySettings settings = settingsOpt.get();
                logInfo("Found existing settings: publicProfile=" + settings.isPublicProfile() +
                        ", allowFollowers=" + settings.isAllowFollowers() +
                        ", allowSearchIndexing=" + settings.isAllowSearchIndexing());
                return settings;
            } else {
                logInfo("Creating default privacy settings for user: " + user.getUsername());
                UserPrivacySettings settings = new UserPrivacySettings(user);
                logInfo("Default settings created: publicProfile=" + settings.isPublicProfile() +
                        ", allowFollowers=" + settings.isAllowFollowers() +
                        ", allowSearchIndexing=" + settings.isAllowSearchIndexing());

                UserPrivacySettings savedSettings = privacyRepository.save(settings);
                logInfo("Saved default settings with ID: " + savedSettings.getUserId());
                return savedSettings;
            }
        } catch (Exception e) {
            logError("Error getting user settings for user " + user.getId(), e);
            throw e;
        } finally {
            logInfo("=== END GET USER SETTINGS ===");
        }
    }

    /**
     * Get current user's privacy settings
     */
    public UserPrivacySettings getCurrentUserSettings() {
        logInfo("Getting privacy settings for current user");
        Long userId = getCurrentUserId();
        logInfo("Current user ID: " + userId);
        return getSettings(userId);
    }

    /**
     * Check if a user's account is private
     *
     * @param userId The user ID to check
     * @return true if the account is private (publicProfile = false), false otherwise
     */
    public boolean isAccountPrivate(Long userId) {
        logInfo("=============== CHECKING PRIVACY STATUS [userId=" + userId + "] ===============");
        try {
            // Get user info for better logging
            String username = "unknown";
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    username = user.getUsername();
                }
            } catch (Exception e) {
                logError("Error getting username for user " + userId, e);
            }

            logInfo("Checking if account is private for user: " + username + " (ID: " + userId + ")");

            // Get settings or defaults
            UserPrivacySettings settings = getSettings(userId);

            // Check raw values from database
            logInfo("Database record - Entity ID: " + settings.getUserId());
            logInfo("Database record - publicProfile: " + settings.isPublicProfile());
            logInfo("Database record - allowFollowers: " + settings.isAllowFollowers());
            logInfo("Database record - allowSearchIndexing: " + settings.isAllowSearchIndexing());

            // Calculate privacy status
            boolean isPrivate = !settings.isPublicProfile();

            logInfo("PRIVACY CHECK RESULT: isPrivate=" + isPrivate);

            // Additional debug info - get a fresh read from database to verify no caching issues
            try {
                var freshSettings = privacyRepository.findByUserId(userId);
                if (freshSettings.isPresent()) {
                    logInfo("DOUBLE-CHECK - Fresh DB read: publicProfile=" + freshSettings.get().isPublicProfile() +
                            " (Should match: " + settings.isPublicProfile() + ")");
                } else {
                    logInfo("DOUBLE-CHECK - No settings found in fresh DB read!");
                }
            } catch (Exception e) {
                logError("Error performing double-check read", e);
            }

            return isPrivate;
        } catch (Exception e) {
            logError("Error checking if account is private for user " + userId, e);
            throw e;
        } finally {
            logInfo("=============== END PRIVACY CHECK ===============");
        }
    }

    /**
     * Check if the current user's account is private
     *
     * @return true if the account is private (publicProfile = false), false otherwise
     */
    public boolean isCurrentAccountPrivate() {
        logInfo("Checking if current user's account is private");
        Long userId = getCurrentUserId();
        logInfo("Current user ID: " + userId);
        return isAccountPrivate(userId);
    }

    /**
     * Update settings for a user based on DTO
     */
    @Transactional
    public UserPrivacySettings updateSettings(Long userId, UserPrivacySettingsDto settingsDto) {
        logInfo("=============== PRIVACY SETTINGS UPDATE [userId=" + userId + "] ===============");
        try {
            // Get user info for better logging
            String username = "unknown";
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    username = user.getUsername();
                }
            } catch (Exception e) {
                logError("Error getting username for user " + userId, e);
            }

            logInfo("Updating privacy settings for user: " + username + " (ID: " + userId + ")");

            UserPrivacySettings settings = getSettings(userId);

            // Log current state in detail
            logInfo("CURRENT SETTINGS:");
            logInfo("  publicProfile = " + settings.isPublicProfile() + " (isPrivate = " + !settings.isPublicProfile() + ")");
            logInfo("  showPoliticalAffiliation = " + settings.isShowPoliticalAffiliation());
            logInfo("  showPostHistory = " + settings.isShowPostHistory());
            logInfo("  showVotingRecord = " + settings.isShowVotingRecord());
            logInfo("  allowDirectMessages = " + settings.isAllowDirectMessages());
            logInfo("  allowFollowers = " + settings.isAllowFollowers());
            logInfo("  allowSearchIndexing = " + settings.isAllowSearchIndexing());
            logInfo("  dataSharing = " + settings.isDataSharing());

            // Log new settings
            logInfo("NEW SETTINGS FROM DTO:");
            logInfo("  publicProfile = " + settingsDto.isPublicProfile() + " (isPrivate = " + !settingsDto.isPublicProfile() + ")");
            logInfo("  showPoliticalAffiliation = " + settingsDto.isShowPoliticalAffiliation());
            logInfo("  showPostHistory = " + settingsDto.isShowPostHistory());
            logInfo("  showVotingRecord = " + settingsDto.isShowVotingRecord());
            logInfo("  allowDirectMessages = " + settingsDto.isAllowDirectMessages());
            logInfo("  allowFollowers = " + settingsDto.isAllowFollowers());
            logInfo("  allowSearchIndexing = " + settingsDto.isAllowSearchIndexing());
            logInfo("  dataSharing = " + settingsDto.isDataSharing());

            // Track privacy setting change
            boolean wasPrivate = !settings.isPublicProfile();
            boolean willBePrivate = !settingsDto.isPublicProfile();

            logInfo("PRIVACY CHANGE: " + (wasPrivate ? "PRIVATE" : "PUBLIC") + " -> " +
                    (willBePrivate ? "PRIVATE" : "PUBLIC"));

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
                logInfo("Setting allowSearchIndexing=false because account is private");
                settings.setAllowSearchIndexing(false);
            } else {
                // Public accounts can be indexed if the user wants
                logInfo("Account is public, using user preference for search indexing: " +
                        settingsDto.isAllowSearchIndexing());
                settings.setAllowSearchIndexing(settingsDto.isAllowSearchIndexing());
            }

            settings.setDataSharing(settingsDto.isDataSharing());

            // Save settings
            logInfo("Saving updated settings to database");
            UserPrivacySettings updatedSettings = privacyRepository.save(settings);

            // Log saved settings
            logInfo("SETTINGS AFTER SAVE:");
            logInfo("  publicProfile = " + updatedSettings.isPublicProfile() +
                    " (isPrivate = " + !updatedSettings.isPublicProfile() + ")");
            logInfo("  allowSearchIndexing = " + updatedSettings.isAllowSearchIndexing());
            logInfo("  allowFollowers = " + updatedSettings.isAllowFollowers());

            // Double-check settings are actually saved by loading fresh from DB
            try {
                var freshSettings = privacyRepository.findByUserId(userId);
                if (freshSettings.isPresent()) {
                    logInfo("VERIFICATION - Fresh DB read: publicProfile=" + freshSettings.get().isPublicProfile() +
                            " (Should match: " + updatedSettings.isPublicProfile() + ")");
                } else {
                    logInfo("VERIFICATION - No settings found in fresh DB read!");
                }
            } catch (Exception e) {
                logError("Error verifying settings update", e);
            }

            // If privacy state changed, log a warning
            if (wasPrivate != willBePrivate) {
                logInfo("!!!!! PRIVACY STATE CHANGED !!!!! From " +
                        (wasPrivate ? "PRIVATE" : "PUBLIC") + " to " +
                        (willBePrivate ? "PRIVATE" : "PUBLIC"));

                if (!wasPrivate && willBePrivate) {
                    logInfo("IMPORTANT: Account changed from PUBLIC to PRIVATE. Existing followers will need handling.");
                }
            }

            return updatedSettings;
        } catch (Exception e) {
            logError("Error updating privacy settings for user " + userId, e);
            throw e;
        } finally {
            logInfo("=============== END PRIVACY UPDATE ===============");
        }
    }

    /**
     * Update current user's privacy settings
     */
    @Transactional
    public UserPrivacySettings updateCurrentUserSettings(UserPrivacySettingsDto settingsDto) {
        logInfo("Updating current user's privacy settings");
        Long userId = getCurrentUserId();
        logInfo("Current user ID: " + userId);
        return updateSettings(userId, settingsDto);
    }

    /**
     * Simplified method to toggle private account setting
     *
     * @return The updated settings
     */
    @Transactional
    public UserPrivacySettings togglePrivateAccount() {
        logInfo("Toggling private account setting for current user");

        UserPrivacySettings settings = getCurrentUserSettings();
        boolean currentlyPrivate = !settings.isPublicProfile();
        logInfo("Current privacy state: " + (currentlyPrivate ? "PRIVATE" : "PUBLIC"));

        UserPrivacySettingsDto dto = toDto(settings);

        // Toggle the private account setting (invert publicProfile)
        dto.setPublicProfile(currentlyPrivate); // Invert current privacy state

        boolean newPrivacyState = !dto.isPublicProfile();
        logInfo("New privacy state after toggle: " + (newPrivacyState ? "PRIVATE" : "PUBLIC"));

        // If making private, enforce other privacy settings
        if (newPrivacyState) {
            logInfo("Account will be private, setting allowSearchIndexing=false");
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
        logInfo("Setting account privacy for user " + userId + " to " + (isPrivate ? "PRIVATE" : "PUBLIC"));

        UserPrivacySettings settings = getSettings(userId);
        UserPrivacySettingsDto dto = toDto(settings);

        // Current state
        boolean currentlyPrivate = !settings.isPublicProfile();
        logInfo("Current privacy state: " + (currentlyPrivate ? "PRIVATE" : "PUBLIC"));

        // Set the private account setting (invert for publicProfile)
        dto.setPublicProfile(!isPrivate);

        logInfo("New publicProfile value: " + dto.isPublicProfile());

        // If making private, enforce other privacy settings
        if (isPrivate) {
            logInfo("Account will be private, setting allowSearchIndexing=false");
            dto.setAllowSearchIndexing(false);
        }

        return updateSettings(userId, dto);
    }

    /**
     * Reset settings to default values
     */
    @Transactional
    public UserPrivacySettings resetSettings(Long userId) {
        logInfo("=============== RESETTING PRIVACY SETTINGS [userId=" + userId + "] ===============");
        try {
            UserPrivacySettings settings = getSettings(userId);

            logInfo("Current settings before reset:");
            logInfo("  publicProfile = " + settings.isPublicProfile());
            logInfo("  showPoliticalAffiliation = " + settings.isShowPoliticalAffiliation());
            logInfo("  showPostHistory = " + settings.isShowPostHistory());
            logInfo("  showVotingRecord = " + settings.isShowVotingRecord());
            logInfo("  allowDirectMessages = " + settings.isAllowDirectMessages());
            logInfo("  allowFollowers = " + settings.isAllowFollowers());
            logInfo("  allowSearchIndexing = " + settings.isAllowSearchIndexing());
            logInfo("  dataSharing = " + settings.isDataSharing());

            // Reset to default values
            logInfo("Resetting to default values");
            settings.setPublicProfile(true); // Not private by default
            settings.setShowPoliticalAffiliation(false);
            settings.setShowPostHistory(true);
            settings.setShowVotingRecord(false);
            settings.setAllowDirectMessages(true);
            settings.setAllowFollowers(true);
            settings.setAllowSearchIndexing(true);
            settings.setDataSharing(false);

            logInfo("Saving reset settings");
            UserPrivacySettings savedSettings = privacyRepository.save(settings);

            logInfo("Settings after reset and save:");
            logInfo("  publicProfile = " + savedSettings.isPublicProfile());
            logInfo("  allowSearchIndexing = " + savedSettings.isAllowSearchIndexing());

            return savedSettings;
        } catch (Exception e) {
            logError("Error resetting privacy settings for user " + userId, e);
            throw e;
        } finally {
            logInfo("=============== END RESET PRIVACY SETTINGS ===============");
        }
    }

    /**
     * Reset current user's settings to default values
     */
    @Transactional
    public UserPrivacySettings resetCurrentUserSettings() {
        logInfo("Resetting current user's privacy settings to defaults");
        Long userId = getCurrentUserId();
        logInfo("Current user ID: " + userId);
        return resetSettings(userId);
    }

    /**
     * Convert entity to DTO
     */
    public UserPrivacySettingsDto toDto(UserPrivacySettings settings) {
        logInfo("Converting UserPrivacySettings to DTO for user " + settings.getUserId());

        UserPrivacySettingsDto dto = new UserPrivacySettingsDto();
        dto.setPublicProfile(settings.isPublicProfile());
        dto.setShowPoliticalAffiliation(settings.isShowPoliticalAffiliation());
        dto.setShowPostHistory(settings.isShowPostHistory());
        dto.setShowVotingRecord(settings.isShowVotingRecord());
        dto.setAllowDirectMessages(settings.isAllowDirectMessages());
        dto.setAllowFollowers(settings.isAllowFollowers());
        dto.setAllowSearchIndexing(settings.isAllowSearchIndexing());
        dto.setDataSharing(settings.isDataSharing());

        logInfo("DTO created with publicProfile=" + dto.isPublicProfile() +
                " (isPrivate=" + !dto.isPublicProfile() + ")");

        return dto;
    }

    /**
     * Get a simplified privacy setting DTO that only shows if the account is private
     */
    public UserPrivacySettingsDto getSimplifiedSettings(Long userId) {
        logInfo("Getting simplified privacy settings for user " + userId);

        UserPrivacySettings settings = getSettings(userId);
        UserPrivacySettingsDto dto = new UserPrivacySettingsDto();
        dto.setPublicProfile(settings.isPublicProfile());

        logInfo("Simplified settings: publicProfile=" + dto.isPublicProfile() +
                " (isPrivate=" + !dto.isPublicProfile() + ")");

        return dto;
    }
}
