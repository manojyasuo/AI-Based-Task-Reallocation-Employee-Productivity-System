package com.taskai.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // ASSIGNMENT, REASSIGNMENT, COMPLETION, VERIFICATION
    private String message;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = true) // Can be null if it's for admin
    private Employee employee;

    @Column(name = "is_read")
    private Boolean read;
    private LocalDateTime createdAt;

    // For verification notifications, store the task ID
    private Long taskId;

    // Legacy constructor for backward compatibility
    public Notification(Long id, String type, String message, Employee employee, Boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.employee = employee;
        this.read = read;
        this.createdAt = createdAt;
        this.taskId = null;
    }

    // Full constructor with taskId
    public Notification(Long id, String type, String message, Employee employee, Boolean read, LocalDateTime createdAt, Long taskId) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.employee = employee;
        this.read = read;
        this.createdAt = createdAt;
        this.taskId = taskId;
    }
}
