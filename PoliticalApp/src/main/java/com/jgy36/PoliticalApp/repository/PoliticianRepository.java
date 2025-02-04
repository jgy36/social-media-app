package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.Politician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoliticianRepository extends JpaRepository<Politician, Long> {
    List<Politician> findByParty(String party);

    List<Politician> findByState(String state);

    List<Politician> findByPosition(String position);
}
