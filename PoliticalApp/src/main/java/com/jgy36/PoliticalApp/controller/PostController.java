package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*") // ✅ Enable CORS for frontend
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository; // ✅ Ensure this is declared


    public PostController(PostService postService, UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
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
    @PreAuthorize("isAuthenticated()") // ✅ Requires authentication
    public ResponseEntity<List<PostDTO>> getPostsFromFollowing() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // 🔹 DEBUG: Print Authentication Details
        System.out.println("🔍 AUTH: " + auth);
        System.out.println("🔍 Authenticated? " + auth.isAuthenticated());
        System.out.println("🔍 Principal: " + auth.getPrincipal());

        if (auth == null || !auth.isAuthenticated()) {
            System.out.println("🚨 No valid authentication found! Returning 401.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            System.out.println("🚨 User not found in DB! Returning 401.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOpt.get();
        List<Long> followingIds = user.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toList());

        if (followingIds.isEmpty()) {
            System.out.println("✅ User follows no one. Returning empty array.");
            return ResponseEntity.ok(List.of());
        }

        List<PostDTO> posts = postService.getPostsFromFollowing(followingIds);
        System.out.println("✅ Returning " + posts.size() + " posts from followed users.");
        return ResponseEntity.ok(posts);
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
