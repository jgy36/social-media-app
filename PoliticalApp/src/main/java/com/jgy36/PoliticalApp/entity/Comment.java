package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // A comment belongs to one user
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne // A comment belongs to one politician
    @JoinColumn(name = "politician_id", nullable = false)
    private Politician politician;

    @Column(nullable = false, length = 1000) // Max comment length: 1000 chars
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

}
