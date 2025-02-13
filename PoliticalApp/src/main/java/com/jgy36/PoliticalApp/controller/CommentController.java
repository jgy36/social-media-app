package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // ✅ Public: Get all comments for a specific politician
    @GetMapping("/politician/{politicianId}")
    public ResponseEntity<List<Comment>> getCommentsByPolitician(@PathVariable Long politicianId) {
        return ResponseEntity.ok(commentService.getCommentsByPolitician(politicianId));
    }

    // ✅ Users: Add a comment to a politician
    @PostMapping("/politician/{politicianId}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Comment> addComment(@PathVariable Long politicianId, @RequestBody String content) {
        return ResponseEntity.ok(commentService.addComment(politicianId, content));
    }

    // ✅ Users or Admins: Delete a comment by ID
    @DeleteMapping("/delete/{commentId}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok("Comment deleted successfully.");
    }

    // ✅ Like a comment (Requires JWT Token)
    @PostMapping("/like/{commentId}")
    public ResponseEntity<String> likeComment(@PathVariable Long commentId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Authentication required");
        }

        commentService.likeComment(commentId);
        return ResponseEntity.ok("Comment liked successfully!");
    }

    @PostMapping("/reply/{commentId}")
    public ResponseEntity<Comment> replyToComment(@PathVariable Long commentId,
                                                  @RequestBody String content,
                                                  Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Comment reply = commentService.replyToComment(commentId, content);
        return ResponseEntity.ok(reply);
    }

}

