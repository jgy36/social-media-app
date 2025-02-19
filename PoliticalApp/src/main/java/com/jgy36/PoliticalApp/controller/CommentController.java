package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.CommentRequest;
import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts") // ✅ Clearer API Structure
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/{postId}/comment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest commentRequest,
            Authentication auth) {

        Comment comment = commentService.addComment(postId, commentRequest.getContent());

        return ResponseEntity.ok(Map.of(
                "message", "Comment added successfully",
                "comment", comment
        ));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok("Comment deleted successfully.");
    }

    @PostMapping("/comments/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> likeComment(@PathVariable Long commentId) {
        commentService.likeComment(commentId);
        return ResponseEntity.ok("Comment liked successfully!");
    }

    @PostMapping("/comments/{commentId}/reply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Comment> replyToComment(@PathVariable Long commentId,
                                                  @RequestBody CommentRequest commentRequest,
                                                  Authentication authentication) {

        Comment reply = commentService.replyToComment(commentId, commentRequest.getContent());
        return ResponseEntity.ok(reply);
    }
}
