package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Conversation;
import com.jgy36.PoliticalApp.entity.Message;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.ConversationRepository;
import com.jgy36.PoliticalApp.repository.MessageRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public MessageService(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Get the current authenticated user
     */
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    /**
     * Get all conversations for the current user
     */
    public List<Map<String, Object>> getUserConversations() {
        User currentUser = getCurrentUser();
        List<Conversation> conversations = conversationRepository.findConversationsByParticipant(currentUser);

        return conversations.stream()
                .map(conversation -> {
                    // Get other participant(s)
                    List<User> otherParticipants = conversation.getParticipants().stream()
                            .filter(user -> !user.equals(currentUser))
                            .collect(Collectors.toList());

                    // Get the latest message
                    Message latestMessage = conversation.getLatestMessage();

                    // Count unread messages
                    int unreadCount = conversation.getUnreadCount(currentUser);

                    Map<String, Object> conversationData = new HashMap<>();
                    conversationData.put("id", conversation.getId());
                    conversationData.put("participants", otherParticipants.stream()
                            .map(user -> Map.of(
                                    "id", user.getId(),
                                    "username", user.getUsername(),
                                    "displayName", user.getDisplayName(),
                                    "profileImageUrl", user.getProfileImageUrl()
                            ))
                            .collect(Collectors.toList()));

                    if (latestMessage != null) {
                        conversationData.put("latestMessage", Map.of(
                                "id", latestMessage.getId(),
                                "content", latestMessage.getContent(),
                                "senderId", latestMessage.getSender().getId(),
                                "senderUsername", latestMessage.getSender().getUsername(),
                                "sentAt", latestMessage.getSentAt(),
                                "read", latestMessage.isRead()
                        ));
                    }

                    conversationData.put("unreadCount", unreadCount);
                    conversationData.put("updatedAt", conversation.getUpdatedAt());

                    return conversationData;
                })
                .sorted(Comparator.comparing(c -> (LocalDateTime) ((Map) c.get("latestMessage")).get("sentAt"), Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    /**
     * Get a conversation by ID
     */
    public Map<String, Object> getConversation(Long conversationId) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found"));

        // Check if the current user is a participant
        if (!conversation.getParticipants().contains(currentUser)) {
            throw new IllegalStateException("You are not a participant in this conversation");
        }

        // Get other participant(s)
        List<User> otherParticipants = conversation.getParticipants().stream()
                .filter(user -> !user.equals(currentUser))
                .collect(Collectors.toList());

        // Get messages
        List<Message> messages = messageRepository.findByConversationOrderBySentAtAsc(conversation);

        // Mark unread messages as read
        markConversationAsRead(conversation, currentUser);

        Map<String, Object> conversationData = new HashMap<>();
        conversationData.put("id", conversation.getId());
        conversationData.put("participants", otherParticipants.stream()
                .map(user -> Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "displayName", user.getDisplayName(),
                        "profileImageUrl", user.getProfileImageUrl()
                ))
                .collect(Collectors.toList()));

        conversationData.put("messages", messages.stream()
                .map(message -> Map.of(
                        "id", message.getId(),
                        "content", message.getContent(),
                        "senderId", message.getSender().getId(),
                        "senderUsername", message.getSender().getUsername(),
                        "sentAt", message.getSentAt(),
                        "read", message.isRead(),
                        "imageUrl", message.getImageUrl() != null ? message.getImageUrl() : ""
                ))
                .collect(Collectors.toList()));

        conversationData.put("createdAt", conversation.getCreatedAt());
        conversationData.put("updatedAt", conversation.getUpdatedAt());

        return conversationData;
    }

    /**
     * Get or create a conversation with another user
     */
    @Transactional
    public Map<String, Object> getOrCreateConversation(Long otherUserId) {
        User currentUser = getCurrentUser();
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Optional<Conversation> existingConversation = conversationRepository.findDirectConversation(currentUser, otherUser);

        Conversation conversation;
        if (existingConversation.isPresent()) {
            conversation = existingConversation.get();
        } else {
            conversation = new Conversation(currentUser, otherUser);
            conversationRepository.save(conversation);
        }

        return getConversation(conversation.getId());
    }

    /**
     * Send a message in a conversation
     */
    @Transactional
    public Map<String, Object> sendMessage(Long conversationId, String content, String imageUrl) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NoSuchElementException("Conversation not found"));

        // Check if the current user is a participant
        if (!conversation.getParticipants().contains(currentUser)) {
            throw new IllegalStateException("You are not a participant in this conversation");
        }

        // Create and save the message
        Message message = new Message(conversation, currentUser, content);
        if (imageUrl != null && !imageUrl.isEmpty()) {
            message.setImageUrl(imageUrl);
        }

        messageRepository.save(message);

        // Update conversation's updatedAt timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Send notifications to other participants
        conversation.getParticipants().stream()
                .filter(user -> !user.equals(currentUser))
                .forEach(recipient -> {
                    String notificationMessage = currentUser.getUsername() + " sent you a message: \"" +
                            (content.length() > 50 ? content.substring(0, 47) + "..." : content) + "\"";
                    notificationService.createNotification(recipient, notificationMessage);
                });

        return Map.of(
                "id", message.getId(),
                "content", message.getContent(),
                "senderId", message.getSender().getId(),
                "senderUsername", message.getSender().getUsername(),
                "sentAt", message.getSentAt(),
                "read", message.isRead(),
                "imageUrl", message.getImageUrl() != null ? message.getImageUrl() : ""
        );
    }

    /**
     * Mark all messages in a conversation as read
     */
    @Transactional
    public void markConversationAsRead(Conversation conversation, User currentUser) {
        List<Message> unreadMessages = messageRepository.findUnreadMessagesInConversation(conversation, currentUser);

        unreadMessages.forEach(message -> {
            message.setRead(true);
            messageRepository.save(message);
        });
    }

    /**
     * Get the total count of unread messages for the current user
     */
    public int getUnreadMessageCount() {
        User currentUser = getCurrentUser();
        return messageRepository.countUnreadMessagesForUser(currentUser);
    }

    /**
     * Search for users to message
     */
    public List<Map<String, Object>> searchUsers(String query) {
        User currentUser = getCurrentUser();
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);

        return users.stream()
                .filter(user -> !user.equals(currentUser))
                .map(user -> {
                    Optional<Conversation> existingConversation =
                            conversationRepository.findDirectConversation(currentUser, user);

                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", user.getId());
                    userData.put("username", user.getUsername());
                    userData.put("displayName", user.getDisplayName());
                    userData.put("profileImageUrl", user.getProfileImageUrl());

                    if (existingConversation.isPresent()) {
                        userData.put("conversationId", existingConversation.get().getId());
                    }

                    return userData;
                })
                .collect(Collectors.toList());
    }
}
