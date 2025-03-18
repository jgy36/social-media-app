package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {

    // Find hashtag by name
    Optional<Hashtag> findByName(String name);

    // Check if hashtag exists
    boolean existsByName(String name);

    // Find hashtags by partial name match
    List<Hashtag> findByNameContainingIgnoreCase(String partialName);

    // Find trending hashtags (by use count)
    @Query("SELECT h FROM Hashtag h ORDER BY h.useCount DESC")
    List<Hashtag> findTrendingHashtags();

    // Find trending hashtags with limit
    @Query("SELECT h FROM Hashtag h ORDER BY h.useCount DESC")
    List<Hashtag> findTrendingHashtagsWithLimit(int limit);

    // Find recent hashtags
    @Query("SELECT h FROM Hashtag h ORDER BY h.createdAt DESC")
    List<Hashtag> findRecentHashtags();

    // Search hashtags by name
    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Hashtag> searchHashtags(@Param("searchTerm") String searchTerm);
}
