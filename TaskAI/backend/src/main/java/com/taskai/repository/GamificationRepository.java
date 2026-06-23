package com.taskai.repository;

import com.taskai.model.Gamification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GamificationRepository extends JpaRepository<Gamification, Long> {
    Optional<Gamification> findByEmployeeId(Long employeeId);
}
