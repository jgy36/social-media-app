package com.jgy36.PoliticalApp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "communities")
public class Community {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String slug; // URL-friendly identifier

    @Column(unique = true, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "creator_id")
    @JsonIgnoreProperties({"password", "email", "verificationToken", "following", "savedPosts"})
    private User creator;

    @ManyToMany
    @JoinTable(
            name = "community_members",
            joinColumns = @JoinColumn(name = "community_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnoreProperties({"password", "email", "verificationToken", "following", "savedPosts"})
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("community")
    private Set<Post> posts = new HashSet<>();

    private String color;
    private String bannerImage;

    // Remove the @ElementCollection approach
    @Transient
    private Set<String> rules = new HashSet<>();

    // Add a string field to store the rules as JSON
    @Column(name = "rules_json", columnDefinition = "text")
    private String rulesJson;
    @ManyToMany
    @JoinTable(
            name = "community_moderators",
            joinColumns = @JoinColumn(name = "community_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnoreProperties({"password", "email", "verificationToken", "following", "savedPosts"})
    private Set<User> moderators = new HashSet<>();

    // Default constructor required by JPA
    public Community() {
    }

    // Constructor with required fields that's being used in CommunityService
    public Community(String name, String slug, String description, User creator) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.creator = creator;
        this.createdAt = LocalDateTime.now();

        // Add creator as a member and moderator
        this.members.add(creator);
        this.moderators.add(creator);
    }

    // Add lifecycle hooks to convert between JSON and Set
    @PostLoad
    protected void onLoad() {
        this.rules = deserializeRules(this.rulesJson);
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.rulesJson = serializeRules(this.rules);
    }

    // Helper methods for serialization/deserialization
    private String serializeRules(Set<String> rules) {
        if (rules == null || rules.isEmpty()) return "[]";

        StringBuilder json = new StringBuilder("[");
        Iterator<String> iterator = rules.iterator();
        while (iterator.hasNext()) {
            json.append("\"").append(iterator.next().replace("\"", "\\\"")).append("\"");
            if (iterator.hasNext()) json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    private Set<String> deserializeRules(String json) {
        Set<String> result = new HashSet<>();
        if (json == null || json.isEmpty() || "[]".equals(json)) return result;

        String content = json.substring(1, json.length() - 1);
        if (content.isEmpty()) return result;

        for (String item : content.split(",")) {
            String clean = item.trim();
            if (clean.startsWith("\"") && clean.endsWith("\"")) {
                clean = clean.substring(1, clean.length() - 1);
            }
            // Unescape any quotes within the string
            clean = clean.replace("\\\"", "\"");
            result.add(clean);
        }
        return result;
    }

    // Helper methods
    public int getMemberCount() {
        return members.size();
    }

    public void addMember(User user) {
        members.add(user);
    }

    public void removeMember(User user) {
        members.remove(user);
    }

    public boolean isMember(User user) {
        return members.contains(user);
    }

    public void addModerator(User user) {
        moderators.add(user);
        // Ensure moderator is also a member
        addMember(user);
    }

    public void removeModerator(User user) {
        moderators.remove(user);
    }

    public boolean isModerator(User user) {
        return moderators.contains(user);
    }
}
