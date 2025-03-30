package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Notification;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.NotificationRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ✅ Fetch Notifications for Logged-in User
    public List<Notification> getUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    // ✅ Mark a notification as read
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // ✅ Utility: Create a new notification
    public void createNotification(User recipient, String message) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    // Update the markAllAsRead method in NotificationService.java
    public void markAllAsRead() {
        // Get current user using the same approach as in getUserNotifications
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find all unread notifications for the user
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndReadFalse(currentUser);

        // Mark each as read
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }

        // Save all updated notifications
        notificationRepository.saveAll(unreadNotifications);
    }
}
