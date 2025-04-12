package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.NotificationPreferencesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/notification-preferences")
public class NotificationPreferencesController {
    private final NotificationPreferencesService preferencesService;

    // Constructor with dependency injection

    @GetMapping
    public ResponseEntity<?> getPreferences() {
        // Implementation
    }

    @PutMapping
    public ResponseEntity<?> updatePreferences(@RequestBody UserNotificationPreferencesDto preferencesDto) {
        // Implementation
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPreferences() {
        // Implementation
    }
}
