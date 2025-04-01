package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.ConversationDTO;
import com.jgy36.PoliticalApp.dto.MessageRequest;
import com.jgy36.PoliticalApp.dto.MessageResponse;
import com.jgy36.PoliticalApp.entity.Conversation;
import com.jgy36.PoliticalApp.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Get all conversations for the current user
     */
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConversationDTO>> getUserConversations() {
        List<ConversationDTO> conversations = messageService.getUserConversations();
        return ResponseEntity.ok(conversations);
    }

    /**
     * Get or create a conversation with another user
     */
    @PostMapping("/conversations/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getOrCreateConversation(@PathVariable Long userId) {
        Conversation conversation = messageService.getOrCreateConversation(userId);
        return ResponseEntity.ok(Map.of("conversationId", conversation.getId()));
    }

    /**
     * Get all messages in a conversation
     */
    @GetMapping("/conversations/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageResponse>> getConversationMessages(@PathVariable Long conversationId) {
        List<MessageResponse> messages = messageService.getConversationMessages(conversationId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a new message to an existing conversation
     */
    @PostMapping("/conversations/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageRequest request) {

        MessageResponse response = messageService.sendMessage(conversationId, request.getContent());
        return ResponseEntity.ok(response);
    }

    /**
     * Start a new conversation with a user
     */
    @PostMapping("/new")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> startConversation(@RequestBody MessageRequest request) {
        if (request.getReceiverId() == null) {
            return ResponseEntity.badRequest().build();
        }

        MessageResponse response = messageService.startConversation(
                request.getReceiverId(), request.getContent());

        return ResponseEntity.ok(response);
    }

    /**
     * Get the count of unread messages
     */
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadMessagesCount() {
        long count = messageService.getUnreadMessagesCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark all messages in a conversation as read
     */
    @PostMapping("/conversations/{conversationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markConversationAsRead(@PathVariable Long conversationId) {
        messageService.markConversationAsRead(conversationId);
        return ResponseEntity.ok().build();
    }
}
