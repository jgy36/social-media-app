package com.jgy36.PoliticalApp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Cascade;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User author;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("post") // ✅ Prevent infinite recursion
    private Set<PostLike> likes = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "posts_liked_users",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "liked_users_id")
    )
    @Cascade(org.hibernate.annotations.CascadeType.ALL)
    @JsonIgnoreProperties("post")
    private Set<User> likedUsers = new HashSet<>(); // ✅ Ensure users can like posts

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("post") // ✅ Prevents infinite loop by managing Comment -> Post serialization
    private Set<Comment> comments = new HashSet<>(); // ✅ Add comments field

    @ManyToMany
    @JoinTable(
            name = "post_hashtags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private Set<Hashtag> hashtags = new HashSet<>();

    // Optional community relationship - if your app has communities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", referencedColumnName = "id")
    @JsonIgnore
    private Community community;

    public Post(String content, User author) {
        this.content = content;
        this.author = author;
        this.createdAt = LocalDateTime.now();
    }

    public int getLikeCount() {
        return likes.size();
    }

    /**
     * Adds a hashtag to this post
     */
    public void addHashtag(Hashtag hashtag) {
        this.hashtags.add(hashtag);
        // Only add this post to hashtag's posts if it's not already there
        if (!hashtag.getPosts().contains(this)) {
            hashtag.getPosts().add(this);
        }
    }

    /**
     * Removes a hashtag from this post
     */
    public void removeHashtag(Hashtag hashtag) {
        this.hashtags.remove(hashtag);
        // Only remove this post from hashtag if it contains it
        if (hashtag.getPosts().contains(this)) {
            hashtag.getPosts().remove(this);
        }
    }
}
