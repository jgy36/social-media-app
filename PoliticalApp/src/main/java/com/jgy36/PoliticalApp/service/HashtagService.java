package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Hashtag;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class HashtagService {

    @Autowired
    private PostRepository postRepository;

    /**
     * Extract hashtags from post content
     *
     * @param content The post content
     * @return A set of hashtags found in the content
     */
    public Set<String> extractHashtags(String content) {
        if (content == null || content.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> hashtags = new HashSet<>();
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            hashtags.add(matcher.group());
        }

        return hashtags;
    }

    /**
     * Find posts containing a specific hashtag
     *
     * @param hashtag The hashtag to search for (with or without the # symbol)
     * @return List of posts containing the hashtag
     */
    public List<Post> getPostsByHashtag(String hashtag) {
        // Add # symbol if not present
        final String searchTag = hashtag.startsWith("#") ? hashtag : "#" + hashtag;

        // Get all posts
        List<Post> allPosts = postRepository.findAll();

        // Filter posts containing the hashtag
        return allPosts.stream()
                .filter(post -> {
                    String content = post.getContent();
                    if (content == null) {
                        return false;
                    }
                    return content.contains(searchTag);
                })
                .collect(Collectors.toList());
    }

    /**
     * Gets information about a hashtag
     *
     * @param hashtag The hashtag to get info for
     * @return A count of how many times the hashtag is used
     */
    public int getHashtagCount(String hashtag) {
        // Add # symbol if not present
        final String searchTag = hashtag.startsWith("#") ? hashtag : "#" + hashtag;

        // Get all posts
        List<Post> allPosts = postRepository.findAll();

        // Count posts containing the hashtag
        return (int) allPosts.stream()
                .filter(post -> {
                    String content = post.getContent();
                    return content != null && content.contains(searchTag);
                })
                .count();
    }

    /**
     * Gets all hashtags used in the system
     *
     * @return List of all hashtags
     */
    public List<Hashtag> getAllHashtags() {
        // Get all posts
        List<Post> allPosts = postRepository.findAll();

        // Extract all hashtags from all posts
        Map<String, Integer> hashtagCounts = new HashMap<>();

        for (Post post : allPosts) {
            if (post.getContent() != null) {
                Set<String> hashtags = extractHashtags(post.getContent());
                for (String hashtag : hashtags) {
                    hashtagCounts.put(hashtag, hashtagCounts.getOrDefault(hashtag, 0) + 1);
                }
            }
        }

        // Convert to list of Hashtag entities and sort alphabetically
        List<Hashtag> hashtagList = hashtagCounts.entrySet().stream()
                .map(entry -> new Hashtag(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(Hashtag::getTag))
                .collect(Collectors.toList());

        return hashtagList;
    }

    /**
     * Gets trending hashtags (most used)
     *
     * @return List of trending hashtags
     */
    public List<Hashtag> getTrendingHashtags() {
        // Default to top 10
        return getTrendingHashtags(10);
    }

    /**
     * Gets trending hashtags with a limit
     *
     * @param limit Number of hashtags to return
     * @return List of trending hashtags with counts
     */
    public List<Hashtag> getTrendingHashtags(int limit) {
        // Get all posts
        List<Post> allPosts = postRepository.findAll();

        // Extract and count all hashtags
        Map<String, Integer> hashtagCounts = new HashMap<>();

        for (Post post : allPosts) {
            if (post.getContent() != null) {
                Set<String> hashtags = extractHashtags(post.getContent());
                for (String hashtag : hashtags) {
                    hashtagCounts.put(hashtag, hashtagCounts.getOrDefault(hashtag, 0) + 1);
                }
            }
        }

        // Convert to list of Hashtag entities
        return hashtagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> new Hashtag(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Search for hashtags containing the query
     *
     * @param query The search query
     * @return List of matching hashtags
     */
    public List<Hashtag> searchHashtags(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String searchTerm = query.toLowerCase();

        // Get all hashtags
        List<Hashtag> allHashtags = getAllHashtags();

        // Filter by query
        return allHashtags.stream()
                .filter(hashtag -> hashtag.getTag().toLowerCase().contains(searchTerm))
                .collect(Collectors.toList());
    }
}
