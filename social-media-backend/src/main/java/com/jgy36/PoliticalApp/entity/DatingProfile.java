package com.jgy36.PoliticalApp.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "dating_profile")
public class DatingProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer age;

    private String location;

    @ElementCollection
    @CollectionTable(name = "dating_profile_photos", joinColumns = @JoinColumn(name = "dating_profile_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "gender_preference")
    private String genderPreference;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "max_distance")
    private Integer maxDistance;

    // Default constructor
    public DatingProfile() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getGenderPreference() { return genderPreference; }
    public void setGenderPreference(String genderPreference) { this.genderPreference = genderPreference; }

    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }

    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }

    public Integer getMaxDistance() { return maxDistance; }
    public void setMaxDistance(Integer maxDistance) { this.maxDistance = maxDistance; }
}
