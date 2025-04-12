package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.PrivacySettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/privacy-settings")
public class PrivacySettingsController {
    private final PrivacySettingsService privacyService;

    // Constructor with dependency injection

    @GetMapping
    public ResponseEntity<?> getSettings() {
        // Implementation
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody UserPrivacySettingsDto settingsDto) {
        // Implementation
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetSettings() {
        // Implementation
    }
}
