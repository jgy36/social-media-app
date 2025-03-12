package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Post;
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
}
