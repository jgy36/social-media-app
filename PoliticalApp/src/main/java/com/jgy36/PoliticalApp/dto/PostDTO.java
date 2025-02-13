package com.jgy36.PoliticalApp.dto;

import com.jgy36.PoliticalApp.entity.Post;

import java.time.LocalDateTime;

public class PostDTO {

    private Long id;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private int likes;

    public PostDTO(Post post) {
        this.id = post.getId();
        this.content = post.getContent();
        this.author = post.getAuthor().getUsername();
        this.createdAt = post.getCreatedAt();
        this.likes = post.getLikes();
    }

    // ✅ Getters
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
}
