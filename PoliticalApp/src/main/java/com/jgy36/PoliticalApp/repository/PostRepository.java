package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Community;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
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

    List<Post> findByContentContainingIgnoreCase(String text);

}
