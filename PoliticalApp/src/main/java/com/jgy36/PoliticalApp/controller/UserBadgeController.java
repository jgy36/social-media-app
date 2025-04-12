package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.UserBadgeDto;
import com.jgy36.PoliticalApp.service.UserBadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserBadgeController {

    private final UserBadgeService userBadgeService;

    @Autowired
    public UserBadgeController(UserBadgeService userBadgeService) {
        this.userBadgeService = userBadgeService;
    }

    @GetMapping("/{userId}/badges")
    public ResponseEntity<UserBadgeDto> getUserBadges(@PathVariable Long userId) {
        UserBadgeDto badges = userBadgeService.getUserBadges(userId);
        return ResponseEntity.ok(badges);
    }

    @PutMapping("/{userId}/badges")
    public ResponseEntity<?> updateUserBadges(
            @PathVariable Long userId,
            @RequestBody List<String> badgeIds) {

        // Security check - ensure user can only modify their own badges
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = getUserIdFromAuth(auth);

        if (!userId.equals(currentUserId)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "You can only update your own badges");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            UserBadgeDto updatedBadges = userBadgeService.saveBadges(userId, badgeIds);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("badges", updatedBadges.getBadges());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{userId}/badges")
    public ResponseEntity<?> clearUserBadges(@PathVariable Long userId) {
        // Security check - ensure user can only modify their own badges
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = getUserIdFromAuth(auth);

        if (!userId.equals(currentUserId)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "You can only clear your own badges");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        userBadgeService.clearBadges(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // Helper method to extract user ID from authentication
    // Modify this to match how your application identifies users
    private Long getUserIdFromAuth(Authentication auth) {
        // This implementation will depend on your security setup
        // This is just an example - adapt to your auth system
        return ((YourUserDetails) auth.getPrincipal()).getId();
    }
}
