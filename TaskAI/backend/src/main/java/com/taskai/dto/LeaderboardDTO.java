package com.taskai.dto;

import lombok.Data;

@Data
public class LeaderboardDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private int points;
    private long completedTasks;
    private long activeTasks;
    private String badge;
    private Float workload;
    private String status;
}
