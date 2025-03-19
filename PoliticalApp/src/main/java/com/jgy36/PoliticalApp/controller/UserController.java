package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.UserProfileDTO;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.service.FollowService;
import com.jgy36.PoliticalApp.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final FollowService followService;
    private final PostService postService;

    public UserController(UserRepository userRepository, FollowService followService, PostService postService) {
        this.userRepository = userRepository;
        this.followService = followService;
        this.postService = postService;
    }

    /**
     * ✅ Get the currently logged-in user's profile.
     * 🔒 Requires a valid JWT token.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // Extract email from token

        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    /**
     * ✅ Get a user's profile by username
     */
    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Get the current authenticated user if available
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        boolean isFollowing = false;

        if (authentication != null && !authentication.getName().equals("anonymousUser")) {
            Optional<User> currentUserOpt = userRepository.findByEmail(authentication.getName());
            if (currentUserOpt.isPresent()) {
                currentUser = currentUserOpt.get();
                isFollowing = currentUser.getFollowing().contains(user);
            }
        }

        // Get user stats
        int followersCount = followService.getFollowerCount(user.getId());
        int followingCount = followService.getFollowingCount(user.getId());
        int postsCount = followService.getPostCount(user.getId());

        // Create user profile DTO with necessary information
        UserProfileDTO profileDTO = new UserProfileDTO();
        profileDTO.setId(user.getId());
        profileDTO.setUsername(user.getUsername());
        profileDTO.setJoinDate(user.getCreatedAt().toString());
        profileDTO.setFollowersCount(followersCount);
        profileDTO.setFollowingCount(followingCount);
        profileDTO.setPostsCount(postsCount);
        profileDTO.setIsFollowing(isFollowing);

        return ResponseEntity.ok(profileDTO);
    }

    /**
     * ✅ Get a user's posts
     */
    @GetMapping("/profile/{username}/posts")
    public ResponseEntity<?> getUserPosts(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        List<Post> posts = postService.getPostsByUserId(user.getId());

        return ResponseEntity.ok(posts);
    }

    /**
     * ✅ Follow a user
     */
    @PostMapping("/follow/{username}")
    public ResponseEntity<?> followUser(@PathVariable String username) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        Optional<User> currentUserOpt = userRepository.findByEmail(authentication.getName());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Current user not found"));
        }

        Optional<User> targetUserOpt = userRepository.findByUsername(username);
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Target user not found"));
        }

        User currentUser = currentUserOpt.get();
        User targetUser = targetUserOpt.get();

        // Don't allow following yourself
        if (currentUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Cannot follow yourself"));
        }

        // Add target user to current user's following list
        currentUser.follow(targetUser);
        userRepository.save(currentUser);

        // Get updated stats
        int followersCount = followService.getFollowerCount(targetUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Successfully followed user");
        response.put("followersCount", followersCount);

        return ResponseEntity.ok(response);
    }

    /**
     * ✅ Unfollow a user
     */
    @DeleteMapping("/unfollow/{username}")
    public ResponseEntity<?> unfollowUser(@PathVariable String username) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required"));
        }

        Optional<User> currentUserOpt = userRepository.findByEmail(authentication.getName());
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Current user not found"));
        }

        Optional<User> targetUserOpt = userRepository.findByUsername(username);
        if (targetUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Target user not found"));
        }

        User currentUser = currentUserOpt.get();
        User targetUser = targetUserOpt.get();

        // Remove target user from current user's following list
        currentUser.unfollow(targetUser);
        userRepository.save(currentUser);

        // Get updated stats
        int followersCount = followService.getFollowerCount(targetUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Successfully unfollowed user");
        response.put("followersCount", followersCount);

        return ResponseEntity.ok(response);
    }

    /**
     * Search for users by username
     *
     * @param query The search query to match against usernames
     * @return List of users matching the search query
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDTO>> searchUsers(@RequestParam String query) {
        // Find users with username containing the query (case insensitive)
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);

        // Convert to UserProfileDTO objects
        List<UserProfileDTO> userDTOs = users.stream()
                .map(user -> {
                    UserProfileDTO dto = new UserProfileDTO();
                    dto.setId(user.getId());
                    dto.setUsername(user.getUsername());
                    dto.setJoinDate(user.getCreatedAt().toString());

                    // Get follower count
                    int followersCount = followService.getFollowerCount(user.getId());
                    int followingCount = followService.getFollowingCount(user.getId());
                    int postsCount = followService.getPostCount(user.getId());

                    dto.setFollowersCount(followersCount);
                    dto.setFollowingCount(followingCount);
                    dto.setPostsCount(postsCount);

                    // Check if current user is following this user
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    boolean isFollowing = false;

                    if (authentication != null && !authentication.getName().equals("anonymousUser")) {
                        Optional<User> currentUserOpt = userRepository.findByEmail(authentication.getName());
                        if (currentUserOpt.isPresent()) {
                            User currentUser = currentUserOpt.get();
                            isFollowing = currentUser.getFollowing().contains(user);
                        }
                    }

                    dto.setIsFollowing(isFollowing);

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    /**
     * ✅ Update the current user's username
     * This allows users to change their username while maintaining proper format requirements
     */
    @PutMapping("/update-username")
    public ResponseEntity<?> updateUsername(@RequestBody Map<String, String> request) {
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
        }

        User user = userOpt.get();
        String newUsername = request.get("username");

        // Validate username
        if (newUsername == null || newUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Username cannot be empty"));
        }

        // Check username format (3-20 chars, alphanumeric, hyphens, underscores)
        Pattern usernamePattern = Pattern.compile("^[a-zA-Z0-9_-]{3,20}$");
        if (!usernamePattern.matcher(newUsername).matches()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false,
                            "message", "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens"));
        }

        // Check if username exists (case insensitive)
        if (userRepository.existsByUsernameIgnoreCase(newUsername) &&
                !user.getUsername().equalsIgnoreCase(newUsername)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "message", "Username already taken"));
        }

        // Update username
        user.setUsername(newUsername);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Username updated successfully");
        response.put("username", newUsername);

        return ResponseEntity.ok(response);
    }

}
