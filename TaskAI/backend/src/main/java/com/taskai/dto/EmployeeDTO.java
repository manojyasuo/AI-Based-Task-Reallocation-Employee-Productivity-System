package com.taskai.dto;

import com.taskai.model.EmployeeStatus;
import lombok.Data;
import java.util.Map;

@Data
public class EmployeeDTO {
    private Long id;
    private String name;
    private String department;
    private Map<String, Integer> skills;
    private Float workload;
    private Float availability;
    private EmployeeStatus status;
    private Float fatigueScore;
    private Integer points;
    private Long completedTasks;
    private Long activeTasks;
    private String email;
}
