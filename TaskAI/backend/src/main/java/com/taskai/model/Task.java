package com.taskai.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String assignmentType;
    private String name;
    private String description;
    private String requiredSkill;
    private Integer priority; // 1 = Low, 2 = High, 3 = Critical
    private LocalDate deadline;
    private Double aiScore;
    
    
    @Enumerated(EnumType.STRING)
    private TaskStatus status;
    
    // Time tracking fields
    private LocalDateTime assignedTime;
    private LocalDateTime startedTime;
    private LocalDateTime verifiedTime;
    
    // File upload fields
    @Column(name = "submitted_file")
    private String submittedFile;
    @Column(name = "file_path")
    private String filePath;
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    private Integer points;
    private String submissionRemarks;
    
    // Employee assignment reference
    private Long assignedEmployeeId;
    
    @Transient
    private String assignedEmployeeName;
}
