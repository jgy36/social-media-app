package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Role;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSettingsInitializer settingsInitializer;
    private final AccountManagementService accountManagementService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserSettingsInitializer settingsInitializer,
            AccountManagementService accountManagementService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingsInitializer = settingsInitializer;
        this.accountManagementService = accountManagementService;
    }

    // Updated register function for userService.ts
    @Transactional
    public User registerUser(String username, String email, String password, String displayName) {
        // ✅ Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists. Please choose another.");
        }

        // ✅ Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists. Please use another email.");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        // Set the display name (new)
        if (displayName != null && !displayName.trim().isEmpty()) {
            user.setDisplayName(displayName);
        } else {
            // Use username as fallback for display name
            user.setDisplayName(username);
        }

        user.setRole(Role.ROLE_USER); // ✅ Set default role to ROLE_USER
        user.setVerified(false); // User must verify email
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiresAt(LocalDateTime.now().plusDays(1));

        try {
            // Save user to get ID
            user = userRepository.save(user);

            // Initialize settings
            settingsInitializer.initializeSettings(user);

            // Save again with settings
            user = userRepository.save(user);

            // Send verification email
            try {
                accountManagementService.sendVerificationEmail(user);
            } catch (MessagingException e) {
                // Log error but continue (non-blocking)
                System.err.println("Failed to send verification email: " + e.getMessage());
            }

            // Return the saved user
            return user;
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("A user with this username or email already exists.");
        }
    }

    /**
     * Find user by ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find user by username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Update user profile
     */
    @Transactional
    public User updateProfile(Long userId, String displayName, String bio, String profileImageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (displayName != null) {
            user.setDisplayName(displayName);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (profileImageUrl != null) {
            user.setProfileImageUrl(profileImageUrl);
        }

        return userRepository.save(user);
    }
}
