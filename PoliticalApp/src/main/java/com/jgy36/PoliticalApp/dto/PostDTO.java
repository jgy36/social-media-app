package com.jgy36.PoliticalApp.dto;

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
    private int likes;  // ✅ Now stores the number of likes
    private List<String> hashtags; // Store just the hashtag strings, not the entities
    private String communityId;
    private String communityName;
    private int commentsCount;
    private boolean isLiked;  // ✅ Added to track if current user liked the post
    private boolean isSaved;  // ✅ Added to track if current user saved the post

    public PostDTO(Post post) {
        this.id = post.getId();
        this.content = post.getContent();
        this.author = post.getAuthor().getUsername();
        this.createdAt = post.getCreatedAt();
        this.likes = post.getLikes().size(); // ✅ Get the count of likes
        this.commentsCount = post.getComments().size();

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

                // If not found in liked users, we need to look elsewhere
                // This is a placeholder - you need proper user lookup depending on your app's structure
                // The actual implementation should use a user repository or service

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

    public int getCommentsCount() {
        return commentsCount;
    }

    public boolean getIsLiked() {
        return isLiked;
    }

    // These setter methods might be useful for manual adjustment if needed
    public void setIsLiked(boolean isLiked) {
        this.isLiked = isLiked;
    }

    public boolean getIsSaved() {
        return isSaved;
    }

    public void setIsSaved(boolean isSaved) {
        this.isSaved = isSaved;
    }
}
