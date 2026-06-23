package com.taskai.repository;

import com.taskai.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeeIdOrderByIdDesc(Long employeeId);
    List<Notification> findByEmployeeIsNullOrderByIdDesc(); // For Admin
}
