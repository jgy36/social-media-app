package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // ✅ Fetch posts from followed users (ordered by newest first)
    @Query("SELECT p FROM Post p WHERE p.author.id IN :followingIds ORDER BY p.createdAt DESC")
    List<Post> findPostsFromFollowing(@Param("followingIds") List<Long> followingIds);

    // ✅ Fetch all posts (for "For You" tab)
    List<Post> findAllByOrderByCreatedAtDesc();

    // ✅ Query to find posts by a specific user
    List<Post> findByAuthorId(Long userId);


}
