// PoliticalApp/src/main/java/com/jgy36/PoliticalApp/service/FollowRequestService.java
package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.FollowRequest;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.entity.UserPrivacySettings;
import com.jgy36.PoliticalApp.exception.ResourceNotFoundException;
import com.jgy36.PoliticalApp.repository.FollowRequestRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import com.jgy36.PoliticalApp.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FollowRequestService {

    @Autowired
    private FollowRequestRepository followRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrivacySettingsService privacySettingsService;

    /**
     * Create a follow request or direct follow based on target user's privacy settings
     *
     * @param targetUserId ID of the user to follow
     * @return True if direct follow, false if request created
     */
    @Transactional
    public boolean createFollowOrRequest(Long targetUserId) {
        // Get current user
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));

        // Get target user
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Can't follow yourself
        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        // Check if already following
        if (currentUser.getFollowing().contains(targetUser)) {
            return true; // Already following
        }

        // Check if already requested
        Optional<FollowRequest> existingRequest = followRequestRepository
                .findByRequesterAndTargetAndStatus(
                        currentUser,
                        targetUser,
                        FollowRequest.RequestStatus.PENDING
                );

        if (existingRequest.isPresent()) {
            return false; // Request already exists
        }

        // Check target user's privacy settings
        boolean isPrivate = false;
        UserPrivacySettings privacySettings = privacySettingsService.getUserSettings(targetUser);
        if (privacySettings != null) {
            isPrivate = !privacySettings.isPublicProfile();
        }

        // If account is public, directly follow
        if (!isPrivate) {
            currentUser.follow(targetUser);
            userRepository.save(currentUser);
            return true;
        }

        // If account is private, create follow request
        FollowRequest followRequest = new FollowRequest(currentUser, targetUser);
        followRequestRepository.save(followRequest);
        return false;
    }

    /**
     * Get all follow requests for a user
     *
     * @param user User to get requests for
     * @return List of follow requests
     */
    public List<FollowRequest> getFollowRequestsForUser(User user) {
        return followRequestRepository.findByTargetAndStatus(user, FollowRequest.RequestStatus.PENDING);
    }

    /**
     * Approve a follow request
     *
     * @param requestId ID of the request to approve
     */
    @Transactional
    public void approveFollowRequest(Long requestId) {
        // Get current user
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));

        // Get the request
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));

        // Check if the request is for the current user
        if (!request.getTarget().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Cannot approve someone else's follow request");
        }

        // Check if request is pending
        if (request.getStatus() != FollowRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        // Approve the request
        request.setStatus(FollowRequest.RequestStatus.APPROVED);
        followRequestRepository.save(request);

        // Create the follow relationship
        User requester = request.getRequester();
        requester.follow(currentUser);
        userRepository.save(requester);
    }

    /**
     * Reject a follow request
     *
     * @param requestId ID of the request to reject
     */
    @Transactional
    public void rejectFollowRequest(Long requestId) {
        // Get current user
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));

        // Get the request
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));

        // Check if the request is for the current user
        if (!request.getTarget().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Cannot reject someone else's follow request");
        }

        // Check if request is pending
        if (request.getStatus() != FollowRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        // Reject the request
        request.setStatus(FollowRequest.RequestStatus.REJECTED);
        followRequestRepository.save(request);
    }

    /**
     * Check if user has a pending follow request to the target
     *
     * @param requester User who might have sent a request
     * @param target    Target user who might have received a request
     * @return True if there is a pending request
     */
    public boolean hasPendingRequest(User requester, User target) {
        return followRequestRepository
                .findByRequesterAndTargetAndStatus(
                        requester,
                        target,
                        FollowRequest.RequestStatus.PENDING
                )
                .isPresent();
    }
}
