package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Role;
import com.jgy36.PoliticalApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username); // ✅ Ensure this method exists

    List<User> findByRole(Role role); // ✅ Fetch all users by role

    Optional<User> findByVerificationToken(String token);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    // ✅ Fetch follower count
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId")
    int countFollowers(Long userId);

    // ✅ Fetch following count
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
    int countFollowing(Long userId);

    // ✅ Fetch post count
    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.id = :userId")
    // 🔹 Use `author` instead of `user`
    int countPosts(Long userId);

    List<User> findByUsernameContainingIgnoreCase(String query);
}
