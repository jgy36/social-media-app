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
     * Get current user's privacy settings
     */
    public UserPrivacySettings getCurrentUserSettings() {
        return getSettings(getCurrentUserId());
    }

    /**
     * Update settings for a user based on DTO
     */
    @Transactional
    public UserPrivacySettings updateSettings(Long userId, UserPrivacySettingsDto settingsDto) {
        UserPrivacySettings settings = getSettings(userId);

        // Update fields from DTO
        settings.setPublicProfile(settingsDto.isPublicProfile());
        settings.setShowPoliticalAffiliation(settingsDto.isShowPoliticalAffiliation());
        settings.setShowPostHistory(settingsDto.isShowPostHistory());
        settings.setShowVotingRecord(settingsDto.isShowVotingRecord());
        settings.setAllowDirectMessages(settingsDto.isAllowDirectMessages());
        settings.setAllowFollowers(settingsDto.isAllowFollowers());
        settings.setAllowSearchIndexing(settingsDto.isAllowSearchIndexing());
        settings.setDataSharing(settingsDto.isDataSharing());

        return privacyRepository.save(settings);
    }

    /**
     * Update current user's privacy settings
     */
    @Transactional
    public UserPrivacySettings updateCurrentUserSettings(UserPrivacySettingsDto settingsDto) {
        return updateSettings(getCurrentUserId(), settingsDto);
    }

    /**
     * Reset settings to default values
     */
    @Transactional
    public UserPrivacySettings resetSettings(Long userId) {
        UserPrivacySettings settings = getSettings(userId);

        // Reset to default values
        settings.setPublicProfile(true);
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
}
