package com.jgy36.PoliticalApp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jgy36.PoliticalApp.entity.Hashtag;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
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
        this.author = post.getAuthor().getUsername();
        this.createdAt = post.getCreatedAt();
        this.likes = post.getLikedUsers().size();
        this.commentsCount = post.getComments().size();
        this.updatedAt = post.getUpdatedAt();


        // Enhanced logging for repost information
        System.out.println("Creating PostDTO for post ID: " + post.getId());
        System.out.println("Is repost? " + post.isRepost());

        if (post.isRepost()) {
            System.out.println("Original post ID: " + post.getOriginalPostId());
            if (post.getOriginalPost() != null) {
                System.out.println("Original post loaded: Yes");
                System.out.println("Original author: " +
                        (post.getOriginalPost().getAuthor() != null ?
                                post.getOriginalPost().getAuthor().getUsername() : "null"));
            } else {
                System.out.println("Original post loaded: No");
            }
        }

        // Initialize repost-related fields
        this.isRepost = post.isRepost();
        this.originalPostId = post.getOriginalPostId();
        this.repostCount = post.getRepostCount();

        // If this is a repost and the original post is available, get the original author
        // In the PostDTO constructor:
        if (post.isRepost() && post.getOriginalPost() != null) {
            this.isRepost = true;
            this.originalPostId = post.getOriginalPostId();
            this.originalAuthor = post.getOriginalPost().getAuthor() != null ?
                    post.getOriginalPost().getAuthor().getUsername() : "Unknown";

            // Add this line to include the original post's content:
            this.originalPostContent = post.getOriginalPost().getContent();
        }

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

        // Check if current authenticated user has liked or saved the post
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            // Check if the current user has liked this post
            this.isLiked = post.getLikedUsers().stream()
                    .anyMatch(user -> user.getEmail().equals(auth.getName()));

            // Get current user if possible
            User currentUser = null;
            try {
                // Try to find the current user in the liked users (optimization)
                currentUser = post.getLikedUsers().stream()
                        .filter(user -> user.getEmail().equals(auth.getName()))
                        .findFirst()
                        .orElse(null);

                // Check if post is saved by current user
                if (currentUser != null && currentUser.getSavedPosts() != null) {
                    this.isSaved = currentUser.getSavedPosts().contains(post);
                }
            } catch (Exception e) {
                // If there's any issue getting saved status, default to false
                System.out.println("Error checking saved status: " + e.getMessage());
                this.isSaved = false;
            }
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
}
