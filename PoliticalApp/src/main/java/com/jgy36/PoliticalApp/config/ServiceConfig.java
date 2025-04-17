package com.jgy36.PoliticalApp.config;

import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.service.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration to handle circular dependencies between services
 */
@Configuration
public class ServiceConfig {

    /**
     * Method to inject UserService into AccountManagementService to break circular dependency
     * By using @Lazy, we prevent the circular dependency issue at startup
     */
    @Bean
    public UserService userServiceForAccountManagement(
            @Lazy AccountManagementService accountManagementService,
            @Lazy UserRepository userRepository,
            @Lazy PasswordEncoder passwordEncoder,
            @Lazy UserSettingsInitializer userSettingsInitializer,
            @Lazy PrivacySettingsService privacySettingsService,
            @Lazy FollowRequestService followRequestService) {

        return new UserService(
                userRepository,                // Was null before
                passwordEncoder,               // Was null before
                userSettingsInitializer,       // Was null before
                accountManagementService,
                privacySettingsService,        // New required parameter
                followRequestService           // New required parameter
        );
    }
}
