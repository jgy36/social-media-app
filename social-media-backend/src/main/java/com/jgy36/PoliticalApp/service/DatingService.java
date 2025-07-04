package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.*;
import com.jgy36.PoliticalApp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DatingService {

    @Autowired
    private DatingProfileRepository datingProfileRepository;

    @Autowired
    private SwipeRepository swipeRepository;

    @Autowired
    private MatchRepository matchRepository;

    public DatingProfile createOrUpdateDatingProfile(User user, DatingProfile profileData) {
        Optional<DatingProfile> existingProfile = datingProfileRepository.findByUser(user);

        if (existingProfile.isPresent()) {
            DatingProfile profile = existingProfile.get();
            // Update existing profile
            profile.setBio(profileData.getBio());
            profile.setAge(profileData.getAge());
            profile.setLocation(profileData.getLocation());
            profile.setPhotos(profileData.getPhotos());
            profile.setGenderPreference(profileData.getGenderPreference());
            profile.setMinAge(profileData.getMinAge());
            profile.setMaxAge(profileData.getMaxAge());
            profile.setMaxDistance(profileData.getMaxDistance());
            return datingProfileRepository.save(profile);
        } else {
            profileData.setUser(user);
            profileData.setIsActive(true);
            return datingProfileRepository.save(profileData);
        }
    }

    public List<DatingProfile> getPotentialMatches(User user) {
        return datingProfileRepository.findActiveDatingProfilesExcludingUser(user.getId());
    }

    public Match swipeUser(User swiper, User target, SwipeDirection direction) {
        // Check if already swiped
        if (swipeRepository.existsBySwiperAndTarget(swiper, target)) {
            throw new RuntimeException("Already swiped on this user");
        }

        // Record the swipe
        Swipe swipe = new Swipe();
        swipe.setSwiper(swiper);
        swipe.setTarget(target);
        swipe.setDirection(direction);
        swipe.setSwipedAt(LocalDateTime.now());
        swipeRepository.save(swipe);

        // Check for match if it was a LIKE
        if (direction == SwipeDirection.LIKE) {
            Optional<Swipe> reciprocalSwipe = swipeRepository.findBySwiperAndTarget(target, swiper);
            if (reciprocalSwipe.isPresent() && reciprocalSwipe.get().getDirection() == SwipeDirection.LIKE) {
                // It's a match!
                Match match = new Match();
                match.setUser1(swiper);
                match.setUser2(target);
                match.setMatchedAt(LocalDateTime.now());
                match.setIsActive(true);
                return matchRepository.save(match);
            }
        }

        return null; // No match
    }

    public List<Match> getUserMatches(User user) {
        return matchRepository.findActiveMatchesForUser(user);
    }
}
