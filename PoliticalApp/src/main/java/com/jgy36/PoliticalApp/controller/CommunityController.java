package com.jgy36.PoliticalApp.controller;

import com.jgy36.PoliticalApp.dto.CommunityDTO;
import com.jgy36.PoliticalApp.dto.CommunityPostRequest;
import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Community;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.service.CommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin(origins = "http://localhost:3000") // FIX: Use specific origin
public class CommunityController {

    private final CommunityService communityService;

    @Autowired
    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    // Get all communities
    @GetMapping
    public ResponseEntity<List<CommunityDTO>> getAllCommunities() {
        List<Community> communities = communityService.getAllCommunities();
        List<CommunityDTO> communityDTOs = communities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(communityDTOs);
    }

    // Get community by slug
    @GetMapping("/{slug}")
    public ResponseEntity<CommunityDTO> getCommunityBySlug(@PathVariable String slug) {
        Community community = communityService.getCommunityBySlug(slug);
        return ResponseEntity.ok(convertToDTO(community));
    }

    // Create new community
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommunityDTO> createCommunity(@RequestBody Map<String, Object> requestBody) {
        String slug = (String) requestBody.get("id");          // Use id as slug
        String name = (String) requestBody.get("name");
        String description = (String) requestBody.get("description");
        String color = (String) requestBody.get("color");

        // Extract rules from List if present
        List<String> rulesList = (List<String>) requestBody.get("rules");
        java.util.Set<String> rules = rulesList != null ? new java.util.HashSet<>(rulesList) : new java.util.HashSet<>();

        Community community = communityService.createCommunity(slug, name, description, rules, color);
        return new ResponseEntity<>(convertToDTO(community), HttpStatus.CREATED);
    }

    // Join a community
    @PostMapping("/{slug}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> joinCommunity(@PathVariable String slug) {
        communityService.joinCommunity(slug);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully joined community");
        return ResponseEntity.ok(response);
    }

    // Leave a community
    @DeleteMapping("/{slug}/leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> leaveCommunity(@PathVariable String slug) {
        communityService.leaveCommunity(slug);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully left community");
        return ResponseEntity.ok(response);
    }

    // Check membership status
    @GetMapping("/{slug}/membership")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> checkMembership(@PathVariable String slug) {
        boolean isMember = communityService.isMember(slug);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isMember", isMember);
        return ResponseEntity.ok(response);
    }

    // Get communities the user is a member of
    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommunityDTO>> getUserCommunities() {
        List<Community> communities = communityService.getUserCommunities();
        List<CommunityDTO> communityDTOs = communities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(communityDTOs);
    }

    // Get community posts
    @GetMapping("/{slug}/posts")
    public ResponseEntity<List<PostDTO>> getCommunityPosts(@PathVariable String slug) {
        List<Post> posts = communityService.getCommunityPosts(slug);
        List<PostDTO> postDTOs = posts.stream()
                .map(post -> new PostDTO(post))
                .collect(Collectors.toList());
        return ResponseEntity.ok(postDTOs);
    }

    // Create a post in a community
    @PostMapping("/{slug}/posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDTO> createCommunityPost(
            @PathVariable String slug,
            @RequestBody CommunityPostRequest postRequest) {

        Post post = communityService.createCommunityPost(slug, postRequest.getContent());
        return new ResponseEntity<>(new PostDTO(post), HttpStatus.CREATED);
    }

    // Search communities
    @GetMapping("/search")
    public ResponseEntity<List<CommunityDTO>> searchCommunities(@RequestParam String query) {
        List<Community> communities = communityService.searchCommunities(query);
        List<CommunityDTO> communityDTOs = communities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(communityDTOs);
    }

    // Get trending communities
    @GetMapping("/trending")
    public ResponseEntity<List<CommunityDTO>> getTrendingCommunities() {
        List<Community> communities = communityService.getTrendingCommunities();
        List<CommunityDTO> communityDTOs = communities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(communityDTOs);
    }

    // Get popular communities
    @GetMapping("/popular")
    public ResponseEntity<List<CommunityDTO>> getPopularCommunities() {
        List<Community> communities = communityService.getPopularCommunities();
        List<CommunityDTO> communityDTOs = communities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(communityDTOs);
    }

    // Helper method to convert Community to CommunityDTO
    private CommunityDTO convertToDTO(Community community) {
        CommunityDTO dto = new CommunityDTO();
        dto.setId(community.getSlug());
        dto.setName(community.getName());
        dto.setDescription(community.getDescription());
        dto.setMembers(community.getMembers().size());
        dto.setCreated(community.getCreatedAt().toString());
        dto.setColor(community.getColor());
        dto.setRules(new java.util.ArrayList<>(community.getRules()));

        // Add moderator usernames
        List<String> moderators = community.getModerators().stream()
                .map(user -> user.getUsername())
                .collect(Collectors.toList());
        dto.setModerators(moderators);

        return dto;
    }


}
