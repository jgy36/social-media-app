package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // ✅ Each comment belongs to a user

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = true)
    private Post post; // ✅ Each comment belongs to a post

    @Column(nullable = false, length = 1000) // Max comment length: 1000 chars
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    // ✅ Constructor needed for new Comment(text, user, post)
    public Comment(String content, User user, Post post) {
        this.content = content;
        this.user = user;
        this.post = post;
        this.createdAt = LocalDateTime.now();
    }
}
