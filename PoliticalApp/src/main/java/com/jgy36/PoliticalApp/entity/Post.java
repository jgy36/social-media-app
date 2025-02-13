package com.jgy36.PoliticalApp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY) // ✅ Optimize query performance
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // 🚀 PREVENT INFINITE LOOP
    private User author;

    @Column(nullable = false, updatable = false) // ✅ Immutable after creation
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostLike> likes = new HashSet<PostLike>(); // ✅ Explicit type declaration


    public Post(String content, User author) {
        this.content = content;
        this.author = author;
        this.createdAt = LocalDateTime.now();
    }

    public int getLikeCount() {
        return likes.size(); // ✅ Like count is now dynamically calculated
    }
}
