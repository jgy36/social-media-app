package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "hashtags")
@NoArgsConstructor
public class Hashtag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String tag;

    private Integer count;

    @ManyToMany(mappedBy = "hashtags")
    private Set<Post> posts = new HashSet<>();

    // For simpler data transfer without the full posts collection
    @Transient
    private String name; // Alias for tag to support getName() for DTOs

    public Hashtag(String tag) {
        this.tag = tag;
        this.count = 1;
        this.name = tag; // Set name to same value as tag
    }

    public Hashtag(String tag, Integer count) {
        this.tag = tag;
        this.count = count;
        this.name = tag; // Set name to same value as tag
    }

    // Used for converting from Map
    public static Hashtag fromMap(Map<String, Object> map) {
        String tag = (String) map.get("tag");
        Integer count = ((Number) map.getOrDefault("count", 1)).intValue();
        return new Hashtag(tag, count);
    }

    // Explicit getters and setters instead of Lombok to ensure they're available
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public Set<Post> getPosts() {
        return posts;
    }

    public void setPosts(Set<Post> posts) {
        this.posts = posts;
    }

    // Helper for getName to support both patterns
    public String getName() {
        return this.tag;
    }

    public void setName(String name) {
        this.name = name;
    }
}
