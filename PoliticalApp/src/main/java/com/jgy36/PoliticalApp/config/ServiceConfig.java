package com.jgy36.PoliticalApp.config;

import com.jgy36.PoliticalApp.service.AccountManagementService;
import com.jgy36.PoliticalApp.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

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
            @Lazy AccountManagementService accountManagementService) {
        return new UserService(
                null, // Will be injected by Spring
                null, // Will be injected by Spring
                null, // Will be injected by Spring
                accountManagementService);
    }
}
