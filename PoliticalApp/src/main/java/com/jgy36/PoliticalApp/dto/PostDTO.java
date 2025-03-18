package com.jgy36.PoliticalApp.dto;

import com.jgy36.PoliticalApp.entity.Hashtag;
import com.jgy36.PoliticalApp.entity.Post;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PostDTO {

    private Long id;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private int likes;  // ✅ Now stores the number of likes
    private List<String> hashtags; // Store just the hashtag strings, not the entities
    private String communityId;
    private String communityName;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.content = post.getContent();
        this.author = post.getAuthor().getUsername();
        this.createdAt = post.getCreatedAt();
        this.likes = post.getLikes().size(); // ✅ Get the count of likes

        // Extract hashtag strings from Hashtag entities
        if (post.getHashtags() != null && !post.getHashtags().isEmpty()) {
            this.hashtags = post.getHashtags().stream()
                    .map(Hashtag::getTag)
                    .collect(Collectors.toList());
        }

        // Add community info if available
        if (post.getCommunity() != null) {
            this.communityId = post.getCommunity().getSlug();
            this.communityName = post.getCommunity().getName();
        }
    }

    // ✅ Getters and Setters
    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getAuthor() {
        return author;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public int getLikes() {
        return likes;
    }

    public List<String> getHashtags() {
        return hashtags;
    }

    public String getCommunityId() {
        return communityId;
    }

    public String getCommunityName() {
        return communityName;
    }
}
