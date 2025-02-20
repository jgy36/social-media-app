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
import java.util.Map;
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

    // ✅ Get all posts
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

    // ✅ Create a new post
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Requires authentication
    public ResponseEntity<Post> createPost(@RequestBody String content) {
        return ResponseEntity.ok(postService.createPost(content));
    }

    // ✅ Get a post by its ID
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        Post post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    // ✅ Delete a post (Only author can delete their own post)
    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()") // Requires authentication
    public ResponseEntity<String> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok("Post deleted successfully");
    }

    // ✅ Get all posts by a user
    @GetMapping("/user/{userId}") // ✅ Ensure this matches the frontend request
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable Long userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    // ✅ Like/Unlike a post
    @PostMapping("/{postId}/like")
    public ResponseEntity<Map<String, Integer>> likePost(@PathVariable Long postId, Authentication auth) {
        int likeCount = postService.toggleLike(postId, auth.getName());
        return ResponseEntity.ok(Map.of("likesCount", likeCount));
    }

    // ✅ Get users who liked a post
    @GetMapping("/{postId}/likes")
    public ResponseEntity<List<String>> getPostLikes(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostLikes(postId));
    }

    // ✅ Save/Unsave a post
    @PostMapping("/{postId}/save")
    public ResponseEntity<String> savePost(@PathVariable Long postId, Authentication auth) {
        postService.toggleSavePost(postId, auth.getName());
        return ResponseEntity.ok("Post saved successfully");
    }

    // ✅ Get all saved posts for a user
    @GetMapping("/saved")
    public ResponseEntity<List<Post>> getSavedPosts(Authentication auth) {
        return ResponseEntity.ok(postService.getSavedPosts(auth.getName()));
    }
}
