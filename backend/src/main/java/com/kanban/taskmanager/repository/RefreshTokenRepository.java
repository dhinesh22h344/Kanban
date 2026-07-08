package com.kanban.taskmanager.repository;

import com.kanban.taskmanager.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshToken rt set rt.revokedAt = :now where rt.user.id = :userId and rt.revokedAt is null")
    void revokeAllForUser(Long userId, LocalDateTime now);

    @Modifying
    void deleteByUserId(Long userId);
}
