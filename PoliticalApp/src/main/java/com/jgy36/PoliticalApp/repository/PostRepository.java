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

    // ✅ Fetch posts from followed users (ordered by newest first)
    @Query("SELECT p FROM Post p WHERE p.author.id IN :followingIds ORDER BY p.createdAt DESC")
    List<Post> findPostsFromFollowing(@Param("followingIds") List<Long> followingIds);

    // ✅ Fetch all posts (for "For You" tab)
    List<Post> findAllByOrderByCreatedAtDesc();

    // ✅ Query to find posts by a specific user
    List<Post> findByAuthorId(Long userId);

    // In PostRepository.java
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.likes WHERE p.id = :postId")
    Optional<Post> findByIdWithDetails(@Param("postId") Long postId);

    @Query("SELECT p FROM Post p WHERE p.community.slug = :communitySlug ORDER BY p.createdAt DESC")
    List<Post> findByCommunitySlugOrderByCreatedAtDesc(@Param("communitySlug") String communitySlug);

    // ✅ NEW: Find trending posts by community (most likes)
    @Query("SELECT p FROM Post p WHERE p.community.id = :communityId ORDER BY SIZE(p.likes) DESC, p.createdAt DESC")
    List<Post> findTrendingByCommunityId(@Param("communityId") String communityId);

    // ✅ NEW: Find posts containing a specific hashtag
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:hashtag% ORDER BY p.createdAt DESC")
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

    // Get reposts of a post
    @Query("SELECT p FROM Post p WHERE p.originalPostId = :postId ORDER BY p.createdAt DESC")
    List<Post> findRepostsOfPost(@Param("postId") Long postId);

    
}
