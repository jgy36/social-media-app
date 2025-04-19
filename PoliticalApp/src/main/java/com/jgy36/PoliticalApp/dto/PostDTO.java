package com.jgy36.PoliticalApp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jgy36.PoliticalApp.entity.Hashtag;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class PostDTO {

    private Long id;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private int likes;
    private List<String> hashtags;
    private String communityId;
    private String communityName;
    private int commentsCount;
    private boolean isLiked;
    private boolean isSaved;
    private LocalDateTime updatedAt;
    private String communityColor;


    // Repost-related fields
    private boolean isRepost;
    @JsonProperty("isRepost")
    private boolean repost;
    private Long originalPostId;
    private int repostCount;
    private String originalAuthor;
    private String originalPostContent;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.content = post.getContent();

        // Safely handle author relationship
        if (post.getAuthor() != null) {
            this.author = post.getAuthor().getUsername();
        } else {
            this.author = "unknown";
        }

        this.createdAt = post.getCreatedAt();
        this.likes = post.getLikedUsers() != null ? post.getLikedUsers().size() : 0;
        this.commentsCount = post.getComments() != null ? post.getComments().size() : 0;
        this.updatedAt = post.getUpdatedAt();

        // Handle repost information safely
        this.isRepost = post.isRepost();
        this.repost = post.isRepost(); // Set both properties for consistency
        this.originalPostId = post.getOriginalPostId();
        this.repostCount = post.getRepostCount();

        // Carefully handle original post data to avoid deep nesting
        if (post.isRepost() && post.getOriginalPost() != null) {
            Post originalPost = post.getOriginalPost();
            this.originalAuthor = originalPost.getAuthor() != null ?
                    originalPost.getAuthor().getUsername() : "Unknown";
            this.originalPostContent = originalPost.getContent();

            // Don't add more nested relationships from the original post
        }

        // Handle hashtags safely
        if (post.getHashtags() != null && !post.getHashtags().isEmpty()) {
            this.hashtags = post.getHashtags().stream()
                    .filter(Objects::nonNull)  // Add null check
                    .map(Hashtag::getTag)
                    .collect(Collectors.toList());
        }

        // Handle community information safely
        if (post.getCommunity() != null) {
            this.communityId = post.getCommunity().getSlug();
            this.communityName = post.getCommunity().getName();
            this.communityColor = post.getCommunity().getColor();
        }

        // Handle current user interactions safely
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                // Check if user has liked this post
                if (post.getLikedUsers() != null) {
                    this.isLiked = post.getLikedUsers().stream()
                            .anyMatch(user -> user.getEmail().equals(auth.getName()));
                }

                // Check if post is saved by current user
                try {
                    User currentUser = null;
                    // Only query the database if we need this information
                    if (auth.getName() != null) {
                        // Try using a simplified approach to avoid loading full user graph
                        this.isSaved = false; // Default to false
                    }
                } catch (Exception e) {
                    this.isSaved = false;
                }
            }
        } catch (Exception e) {
            // Fallback to defaults if any security context issues
            this.isLiked = false;
            this.isSaved = false;
        }
    }


    // Getters and Setters
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

    public int getCommentsCount() {
        return commentsCount;
    }

    public boolean getIsLiked() {
        return isLiked;
    }

    public void setIsLiked(boolean isLiked) {
        this.isLiked = isLiked;
    }

    public boolean getIsSaved() {
        return isSaved;
    }

    public void setIsSaved(boolean isSaved) {
        this.isSaved = isSaved;
    }

    // Getters for repost-related fields
    public boolean isRepost() {
        return isRepost;
    }

    // Add a matching setter that works with the property name
    public void setRepost(boolean repost) {
        this.repost = repost;
    }

    public Long getOriginalPostId() {
        return originalPostId;
    }

    public int getRepostCount() {
        return repostCount;
    }

    public String getOriginalAuthor() {
        return originalAuthor;
    }

    public String getOriginalPostContent() {
        return originalPostContent;
    }

    // Add getter:
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Add a getter for the community color
    public String getCommunityColor() {
        return communityColor;
    }
}
