package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Follow;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.FollowRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowService(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    public void followUser(Long userIdToFollow) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User userToFollow = userRepository.findById(userIdToFollow)
                .orElseThrow(() -> new IllegalArgumentException("User to follow not found"));

        if (!followRepository.existsByFollowerAndFollowing(currentUser, userToFollow)) {
            followRepository.save(new Follow(currentUser, userToFollow));
        }
    }

    public void unfollowUser(Long userIdToUnfollow) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User userToUnfollow = userRepository.findById(userIdToUnfollow)
                .orElseThrow(() -> new IllegalArgumentException("User to unfollow not found"));

        followRepository.deleteByFollowerAndFollowing(currentUser, userToUnfollow);
    }

    public List<Long> getFollowingIds() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return followRepository.findByFollower(currentUser)
                .stream()
                .map(follow -> follow.getFollowing().getId())
                .collect(Collectors.toList());
    }
}
