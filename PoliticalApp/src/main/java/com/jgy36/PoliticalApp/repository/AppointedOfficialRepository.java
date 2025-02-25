package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.AppointedOfficial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointedOfficialRepository extends JpaRepository<AppointedOfficial, Long> {
    boolean existsByName(String name);
}
