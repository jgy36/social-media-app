package com.jgy36.PoliticalApp.repository;

import com.jgy36.PoliticalApp.entity.ConnectedAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount, Long> {
    List<ConnectedAccount> findByUserId(Long userId);

    Optional<ConnectedAccount> findByUserIdAndProvider(Long userId, String provider);
}
