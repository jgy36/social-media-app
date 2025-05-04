package com.jgy36.PoliticalApp.scheduler;

import com.jgy36.PoliticalApp.repository.PendingUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PendingUserCleanupTask {
    @Autowired
    private PendingUserRepository pendingUserRepository;

    @Scheduled(cron = "0 0 * * * *") // Run every hour
    public void cleanupExpiredPendingUsers() {
        pendingUserRepository.deleteExpiredPendingUsers(LocalDateTime.now());
    }
}
