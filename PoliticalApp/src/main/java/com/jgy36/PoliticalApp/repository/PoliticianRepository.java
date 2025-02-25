package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Politician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoliticianRepository extends JpaRepository<Politician, Long> {

    boolean existsByName(String name);

    // Find all politicians by party
    List<Politician> findByParty(String party);

    // Find all politicians by state
    List<Politician> findByState(String state);

    // Find all politicians by county
    List<Politician> findByCounty(String county);

    // Find all politicians by position
    List<Politician> findByPosition(String position);

    // Check if a politician exists by name and state (for statewide officials)
    boolean existsByNameAndState(String name, String state);

    // Check if a politician exists by name, state, and county (for local officials)
    boolean existsByNameAndStateAndCounty(String name, String state, String county);

    // Fetch all stored counties to track missing ones
    @Query("SELECT DISTINCT p.county, p.state FROM Politician p WHERE p.county IS NOT NULL")
    List<Object[]> findAllStoredCounties();

    boolean existsByStateAndCounty(String state, String county);
}
