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
    Optional<Hashtag> findByTag(String tag);

    // Check if hashtag exists
    boolean existsByTag(String tag);

    // Find hashtags by partial name match
    List<Hashtag> findByTagContainingIgnoreCase(String partialTag);

    // Find trending hashtags (by use count)
    @Query("SELECT h FROM Hashtag h ORDER BY h.count DESC")
    List<Hashtag> findTrendingHashtags();

    // Find trending hashtags with limit
    @Query("SELECT h FROM Hashtag h ORDER BY h.count DESC")
    List<Hashtag> findTrendingHashtagsWithLimit(int limit);

    // Find recent hashtags (sorted by ID since newest will have higher IDs)
    @Query("SELECT h FROM Hashtag h ORDER BY h.id DESC")
    List<Hashtag> findRecentHashtags();

    // Search hashtags by name
    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.tag) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Hashtag> searchHashtags(@Param("searchTerm") String searchTerm);
}
