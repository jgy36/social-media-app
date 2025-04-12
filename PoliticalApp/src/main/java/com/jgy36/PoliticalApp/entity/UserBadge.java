package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // Store as plain text instead of using JSON type
    @Column(name = "badge_ids_json", columnDefinition = "text")
    private String badgeIdsJson;

    @Transient // Not stored in DB
    private List<String> badgeIds = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // COMBINED lifecycle method - this replaces your previous @PrePersist and @PreUpdate methods
    @PrePersist
    @PreUpdate
    protected void onSaveOrUpdate() {
        // Initialize created date if new entity
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        // Always update the timestamp
        this.updatedAt = LocalDateTime.now();

        // Convert badge IDs to JSON when saving
        if (badgeIds != null) {
            this.badgeIdsJson = serializeBadgeIds(this.badgeIds);
        }
    }

    // Load method stays simple
    @PostLoad
    protected void onLoad() {
        this.badgeIds = deserializeBadgeIds(this.badgeIdsJson);
    }

    // Helper methods for JSON conversion
    private String serializeBadgeIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) return "[]";

        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < ids.size(); i++) {
            json.append("\"").append(ids.get(i)).append("\"");
            if (i < ids.size() - 1) json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    private List<String> deserializeBadgeIds(String json) {
        List<String> result = new ArrayList<>();
        if (json == null || json.isEmpty() || "[]".equals(json)) return result;

        String content = json.substring(1, json.length() - 1);
        if (content.isEmpty()) return result;

        for (String item : content.split(",")) {
            String clean = item.trim();
            if (clean.startsWith("\"") && clean.endsWith("\"")) {
                clean = clean.substring(1, clean.length() - 1);
            }
            result.add(clean);
        }
        return result;
    }
}
