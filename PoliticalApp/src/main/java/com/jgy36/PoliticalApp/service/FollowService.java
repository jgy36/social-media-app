package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final UserRepository userRepository;

    public FollowService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void followUser(Long userId) {
        User currentUser = getAuthenticatedUser();
        User userToFollow = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (currentUser.equals(userToFollow)) {
            throw new IllegalArgumentException("You cannot follow yourself.");
        }

        currentUser.getFollowing().add(userToFollow);
        userRepository.save(currentUser);
    }

    public void unfollowUser(Long userId) {
        User currentUser = getAuthenticatedUser();
        User userToUnfollow = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        currentUser.getFollowing().remove(userToUnfollow);
        userRepository.save(currentUser);
    }

    public List<Long> getFollowingIds() {
        User currentUser = getAuthenticatedUser();

        // ✅ FIX: Use Collectors.toList() instead of .toList()
        return currentUser.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toList()); // ✅ FIXED HERE
    }
}

