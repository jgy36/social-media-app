package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Community;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Updated: Added LEFT JOIN FETCH p.originalPost to load original post data
    @Query("SELECT DISTINCT p FROM Post p " +
            "LEFT JOIN FETCH p.author " +
            "LEFT JOIN FETCH p.originalPost op " +
            "LEFT JOIN FETCH op.author " +
            "WHERE p.author.id IN :followingIds " +
            "ORDER BY p.createdAt DESC")
    List<Post> findPostsFromFollowing(@Param("followingIds") List<Long> followingIds);

    // Updated: Custom implementation to fetch all posts with original post data
    @Query("SELECT DISTINCT p FROM Post p " +
            "LEFT JOIN FETCH p.author " +
            "LEFT JOIN FETCH p.originalPost op " +
            "LEFT JOIN FETCH op.author " +
            "ORDER BY p.createdAt DESC")
    List<Post> findAllWithOriginalPostOrderByCreatedAtDesc();

    // Legacy method kept for backward compatibility
    List<Post> findAllByOrderByCreatedAtDesc();

    // Query to find posts by a specific user
    List<Post> findByAuthorId(Long userId);

    // Updated to include original post data
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.likes LEFT JOIN FETCH p.originalPost WHERE p.id = :postId")
    Optional<Post> findByIdWithDetails(@Param("postId") Long postId);

    // Updated to include original post data
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.originalPost WHERE p.community.slug = :communitySlug ORDER BY p.createdAt DESC")
    List<Post> findByCommunitySlugOrderByCreatedAtDesc(@Param("communitySlug") String communitySlug);

    // Updated to include original post data
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.originalPost WHERE p.community.id = :communityId ORDER BY SIZE(p.likes) DESC, p.createdAt DESC")
    List<Post> findTrendingByCommunityId(@Param("communityId") String communityId);

    // Updated to include original post data
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.originalPost WHERE p.content LIKE %:hashtag% ORDER BY p.createdAt DESC")
    List<Post> findByContentContainingHashtag(@Param("hashtag") String hashtag);

    // Find posts by community, ordered by creation date (newest first)
    List<Post> findByCommunityOrderByCreatedAtDesc(Community community);

    // Find posts by community and author
    List<Post> findByCommunityAndAuthor(Community community, User author);

    // Count posts in a community
    long countByCommunity(Community community);

    // Find posts containing text
    List<Post> findByContentContainingIgnoreCase(String text);

    // Find posts with a specific hashtag
    @Query("SELECT p FROM Post p JOIN p.hashtags h WHERE h.tag = :tag")
    List<Post> findByHashtagTag(@Param("tag") String tag);

    // Find posts with hashtag search parameter
    @Query("SELECT p FROM Post p JOIN p.hashtags h WHERE h.tag LIKE %:query% OR h.tag = :query")
    List<Post> findByHashtagContainingIgnoreCase(@Param("query") String query);

    // Update repost count
    @Modifying
    @Query("UPDATE Post p SET p.repostCount = p.repostCount + 1 WHERE p.id = :postId")
    void incrementRepostCount(@Param("postId") Long postId);

    @Modifying
    @Query("UPDATE Post p SET p.repostCount = p.repostCount - 1 WHERE p.id = :postId AND p.repostCount > 0")
    void decrementRepostCount(@Param("postId") Long postId);

    // Updated to include original post data
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.originalPost WHERE p.originalPostId = :postId ORDER BY p.createdAt DESC")
    List<Post> findRepostsOfPost(@Param("postId") Long postId);

    List<Post> findByAuthor(User author);

    List<Post> findByCommunity(Community community);

    // Search for posts with a specific hashtag
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:hashtag%")
    List<Post> findByHashtag(String hashtag);

    // Get trending posts (based on likes and comments)
    @Query("SELECT p FROM Post p ORDER BY SIZE(p.likes) + SIZE(p.comments) DESC")
    List<Post> findTrendingPosts();
}
