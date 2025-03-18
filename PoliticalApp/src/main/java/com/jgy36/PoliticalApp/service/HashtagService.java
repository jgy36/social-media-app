package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Hashtag;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.repository.HashtagRepository;
import com.jgy36.PoliticalApp.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class HashtagService {

    @Autowired
    private HashtagRepository hashtagRepository;

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
        return hashtagRepository.findAll();
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
        return hashtagRepository.findTrendingHashtags().stream()
                .limit(limit)
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

        // Process the query string - make it effectively final by creating a new variable
        String cleanQuery = query.toLowerCase();
        if (cleanQuery.startsWith("#")) {
            cleanQuery = cleanQuery.substring(1);
        }

        // Use the final variable in the lambda expressions
        final String finalSearchTerm = cleanQuery;

        // First try to use the repository method if it exists
        try {
            return hashtagRepository.findByTagContainingIgnoreCase(finalSearchTerm);
        } catch (Exception e) {
            // Fallback method if the repository method is not available
            System.out.println("Warning: Using fallback hashtag search method. Please implement findByTagContainingIgnoreCase in HashtagRepository.");

            // Get all hashtags and filter manually
            return hashtagRepository.findAll().stream()
                    .filter(hashtag -> hashtag.getTag().toLowerCase().contains(finalSearchTerm))
                    .collect(Collectors.toList());
        }
    }
}
