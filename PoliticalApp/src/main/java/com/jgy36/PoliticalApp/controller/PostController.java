package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * ✅ Get all posts
     */
    @GetMapping("/for-you")
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // ✅ Get posts from users that the current user follows
    @GetMapping("/following")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostDTO>> getPostsFromFollowing() {
        return ResponseEntity.ok(postService.getPostsFromFollowing());
    }


    /**
     * ✅ Create a new post
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Requires authentication
    public ResponseEntity<Post> createPost(@RequestBody String content) {
        return ResponseEntity.ok(postService.createPost(content));
    }

    /**
     * ✅ Delete a post (Only author can delete their own post)
     */
    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()") // Requires authentication
    public ResponseEntity<String> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok("Post deleted successfully");
    }

    /**
     * ✅ Like a post
     */
    @PostMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> likePost(@PathVariable Long postId) {
        String message = postService.likePost(postId);
        return ResponseEntity.ok(message);
    }
}
