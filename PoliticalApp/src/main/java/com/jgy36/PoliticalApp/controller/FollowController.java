package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<String> followUser(@PathVariable Long userId) {
        followService.followUser(userId);
        return ResponseEntity.ok("User followed successfully.");
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long userId) {
        followService.unfollowUser(userId);
        return ResponseEntity.ok("User unfollowed successfully.");
    }

    @GetMapping("/following")
    public ResponseEntity<List<Long>> getFollowingIds() {
        return ResponseEntity.ok(followService.getFollowingIds());
    }
}
