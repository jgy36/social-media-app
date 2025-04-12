package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.UserPrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPrivacySettingsRepository extends JpaRepository<UserPrivacySettings, Long> {
    Optional<UserPrivacySettings> findByUserId(Long userId);
}
