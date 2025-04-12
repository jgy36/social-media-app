package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.AccountManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class AccountManagementController {
    private final AccountManagementService accountService;

    // Constructor with dependency injection

    @GetMapping("/email/verification-status")
    public ResponseEntity<?> getEmailVerificationStatus() {
        // Implementation
    }

    @PostMapping("/email/send-verification")
    public ResponseEntity<?> sendVerificationEmail() {
        // Implementation
    }

    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        // Implementation
    }

    @PostMapping("/email/change")
    public ResponseEntity<?> requestEmailChange(@RequestBody ChangeEmailRequest request) {
        // Implementation
    }

    @GetMapping("/connected-accounts")
    public ResponseEntity<?> getConnectedAccounts() {
        // Implementation
    }

    @PostMapping("/connected-accounts/{provider}")
    public ResponseEntity<?> connectSocialAccount(
            @PathVariable String provider,
            @RequestBody SocialConnectRequest request) {
        // Implementation
    }

    @DeleteMapping("/connected-accounts/{provider}")
    public ResponseEntity<?> disconnectSocialAccount(@PathVariable String provider) {
        // Implementation
    }

    @GetMapping("/data-export")
    public ResponseEntity<?> exportUserData() {
        // Implementation
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteUserAccount() {
        // Implementation
    }
}
