package com.taskai.controller;

import com.taskai.model.*;
import com.taskai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private TaskAssignmentRepository taskAssignmentRepository;
    @Autowired private ActivityLogRepository activityLogRepository;

    @GetMapping("/dashboardStats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalEmployees    = employeeRepository.count();
        long activeTasks       = taskRepository.findByStatus(TaskStatus.ASSIGNED).size()
                               + taskRepository.findByStatus(TaskStatus.IN_PROGRESS).size();
        long submittedTasks    = taskRepository.findByStatus(TaskStatus.SUBMITTED).size();
        long completedTasks    = taskRepository.findByStatus(TaskStatus.COMPLETED).size();
        long reassignedTasks   = taskRepository.findByStatus(TaskStatus.REASSIGNED).size();
        long verifiedTasks     = completedTasks;
        long totalTasks        = taskRepository.count();

        stats.put("totalEmployees", totalEmployees);
        stats.put("activeTasks", activeTasks);
        stats.put("submittedTasks", submittedTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("verifiedTasks", verifiedTasks);
        stats.put("reassignedTasks", reassignedTasks);
        stats.put("totalTasks", totalTasks);
        stats.put("successRate", totalTasks > 0 ? Math.round((completedTasks * 100.0) / totalTasks) : 0);

        return stats;
    }

    /** Activity Timeline – last 50 events */
    @GetMapping("/activity")
    public List<Map<String, Object>> getActivityTimeline() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream().map(log -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", log.getId());
                    m.put("action", log.getAction());
                    m.put("actor", log.getActor());
                    m.put("description", log.getDescription());
                    m.put("createdAt", log.getCreatedAt().toString());
                    return m;
                }).collect(Collectors.toList());
    }

    /** Smart Alerts – overloaded, near deadline, on-leave with pending tasks */
    @GetMapping("/alerts")
    public List<Map<String, Object>> getSmartAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Overloaded employees (workload > 80%)
        employeeRepository.findAll().stream()
                .filter(e -> e.getWorkload() != null && e.getWorkload() > 80)
                .forEach(e -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("type", "OVERLOADED");
                    alert.put("severity", "HIGH");
                    alert.put("message", e.getName() + " is overloaded (" + Math.round(e.getWorkload()) + "% workload)");
                    alert.put("employeeId", e.getId());
                    alerts.add(alert);
                });

        // 2. Tasks with deadline in next 2 days
        taskRepository.findAll().stream()
                .filter(t -> t.getDeadline() != null
                        && !t.getStatus().equals(TaskStatus.COMPLETED)
                        && t.getDeadline().isBefore(today.plusDays(3))
                        && t.getDeadline().isAfter(today.minusDays(1)))
                .forEach(t -> {
                    long daysLeft = today.until(t.getDeadline(), java.time.temporal.ChronoUnit.DAYS);
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("type", "DEADLINE_NEAR");
                    alert.put("severity", daysLeft <= 1 ? "CRITICAL" : "MEDIUM");
                    alert.put("message", "Task '" + t.getName() + "' deadline in " + daysLeft + " day(s)");
                    alert.put("taskId", t.getId());
                    alerts.add(alert);
                });

        // 3. On-leave employees with active tasks
        employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ON_LEAVE)
                .forEach(e -> {
                    long pending = taskAssignmentRepository.findByEmployeeId(e.getId()).stream()
                            .filter(a -> a.getTask().getStatus() == TaskStatus.ASSIGNED
                                    || a.getTask().getStatus() == TaskStatus.IN_PROGRESS)
                            .count();
                    if (pending > 0) {
                        Map<String, Object> alert = new HashMap<>();
                        alert.put("type", "ON_LEAVE_PENDING");
                        alert.put("severity", "HIGH");
                        alert.put("message", e.getName() + " is on leave with " + pending + " pending task(s)");
                        alert.put("employeeId", e.getId());
                        alerts.add(alert);
                    }
                });

        // 4. High fatigue employees
        employeeRepository.findAll().stream()
                .filter(e -> e.getFatigueScore() != null && e.getFatigueScore() > 70)
                .forEach(e -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("type", "HIGH_FATIGUE");
                    alert.put("severity", "MEDIUM");
                    alert.put("message", e.getName() + " has high fatigue score (" + Math.round(e.getFatigueScore()) + "%)");
                    alert.put("employeeId", e.getId());
                    alerts.add(alert);
                });

        return alerts;
    }

    /** Per-employee performance data for charts */
    @GetMapping("/performance")
    public List<Map<String, Object>> getEmployeePerformance() {
        return employeeRepository.findAll().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", e.getName().split(" ")[0]);
            m.put("fullName", e.getName());
            m.put("department", e.getDepartment());
            m.put("workload", e.getWorkload());
            m.put("availability", e.getAvailability());
            m.put("fatigueScore", e.getFatigueScore());
            m.put("status", e.getStatus());

            long completed = taskAssignmentRepository.findByEmployeeId(e.getId())
                    .stream().filter(a -> a.getTask().getStatus() == TaskStatus.COMPLETED).count();
            m.put("completedTasks", completed);
            return m;
        }).collect(Collectors.toList());
    }
}
