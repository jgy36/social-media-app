package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    // ✅ Ensure User is Authenticated
    @PostMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> followUser(@PathVariable Long userId) {
        followService.followUser(userId);
        return ResponseEntity.ok("User followed successfully.");
    }


    @DeleteMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> unfollowUser(@PathVariable Long userId) {
        followService.unfollowUser(userId);
        return ResponseEntity.ok("User unfollowed successfully.");
    }

    // ✅ Ensure authentication for getting following users
    @GetMapping("/following")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Long>> getFollowingIds() {
        return ResponseEntity.ok(followService.getFollowingIds());
    }

    // ✅ Ensure authentication for getting follower count
    @GetMapping("/stats/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getFollowStats(@PathVariable Long userId) {
        int followers = followService.getFollowerCount(userId);
        int following = followService.getFollowingCount(userId);
        int posts = followService.getPostCount(userId);

        return ResponseEntity.ok(Map.of(
                "followersCount", followers,
                "followingCount", following,
                "postCount", posts
        ));
    }
}
