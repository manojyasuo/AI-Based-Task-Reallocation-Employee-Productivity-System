package com.taskai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;     // e.g. TASK_ASSIGNED, TASK_SUBMITTED, LEAVE_APPROVED
    private String actor;      // employee name or "Admin"
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
