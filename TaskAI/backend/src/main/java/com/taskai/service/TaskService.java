package com.taskai.service;

import com.taskai.model.*;
import com.taskai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private TaskAssignmentRepository taskAssignmentRepository;
    @Autowired private AITaskAllocationService aiTaskAllocationService;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private GamificationRepository gamificationRepository;
    @Autowired private EmailService emailService;
    @Autowired private ActivityLogRepository activityLogRepository;

    // ─────────────────────────── helpers ───────────────────────────

    private void logActivity(String action, String actor, String description) {
        ActivityLog log = new ActivityLog();
        log.setAction(action);
        log.setActor(actor);
        log.setDescription(description);
        log.setCreatedAt(LocalDateTime.now());
        activityLogRepository.save(log);
    }

    // ─────────────────────────── create ────────────────────────────

    @Transactional
    public Task createTask(Task task, boolean autoAssign) {
    task.setStatus(TaskStatus.PENDING);

    // 🔥 OPTIONAL: default type before assignment
    task.setAssignmentType(null);

    task = taskRepository.save(task);

    if (autoAssign) {
        allocatePendingTask(task);
    }

    return task;
}

public Employee allocatePendingTask(Task task) {
    Employee bestEmployee = aiTaskAllocationService.allocateTask(task);

    if (bestEmployee != null) {
        assignTask(task.getId(), bestEmployee.getId(), "AI");
        return bestEmployee;
    }

    return null;
}

@Transactional
public void assignTask(Long taskId, Long employeeId, String assigner) {

    Task task = taskRepository.findById(taskId).orElse(null);
    Employee emp = employeeRepository.findById(employeeId).orElse(null);

    if (task == null) {
        System.err.println("[TaskService] assignTask failed: task not found for id=" + taskId);
    }

    if (emp == null) {
        System.err.println("[TaskService] assignTask failed: employee not found for id=" + employeeId);
    }

    if (task != null && emp != null) {

        // 🔥 REMOVE OLD ASSIGNMENT
        taskAssignmentRepository.findByTask(task).ifPresent(a -> {
            Employee oldEmp = a.getEmployee();

            oldEmp.setWorkload(Math.max(0.0f, oldEmp.getWorkload() - 20.0f));
            oldEmp.setAvailability(Math.min(100.0f, oldEmp.getAvailability() + 20.0f));

            employeeRepository.save(oldEmp);
            taskAssignmentRepository.delete(a);
        });

        // 🔥 CREATE NEW ASSIGNMENT
        TaskAssignment assignment = new TaskAssignment();
        assignment.setTask(task);
        assignment.setEmployee(emp);

        LocalDateTime now = LocalDateTime.now();
        assignment.setAssignedAt(now);

        taskAssignmentRepository.save(assignment);

        // 🔥 UPDATE TASK
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedEmployeeId(emp.getId());
        task.setAssignedTime(now);

        // =========================
        // 🔥🔥🔥 MAIN FIX HERE 🔥🔥🔥
        // =========================
        if ("AI".equalsIgnoreCase(assigner)) {
            task.setAssignmentType("AI");
        } else {
            task.setAssignmentType("MANUAL");
        }
        // =========================

        taskRepository.save(task);

        // 🔥 UPDATE EMPLOYEE LOAD
        emp.setWorkload(Math.min(100.0f, emp.getWorkload() + 20.0f));
        emp.setAvailability(Math.max(0.0f, emp.getAvailability() - 20.0f));

        employeeRepository.save(emp);

        // 🔔 NOTIFICATION
        Notification notification = new Notification(
                null,
                "ASSIGNMENT",
                "You have a new task: " + task.getName() + " (Assigned by " + assigner + ")",
                emp,
                false,
                now
        );

        notificationRepository.save(notification);

        // 📊 ACTIVITY LOG
        logActivity(
                "TASK_ASSIGNED",
                assigner,
                "Task '" + task.getName() + "' assigned to " + emp.getName()
        );

        // 📧 EMAIL
        try {
            emailService.sendTaskAssignmentEmail(
                    emp.getUser().getEmail(),
                    emp.getName(),
                    task.getName(),
                    task.getDeadline().toString()
            );
        } catch (Exception ignored) {}
    }
}

    // ─────────────────────────── read ──────────────────────────────

    public List<Task> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            try {
                taskAssignmentRepository.findByTask(task).ifPresent(a ->
                        task.setAssignedEmployeeName(a.getEmployee().getName()));
            } catch (Exception e) {
                // Log the error but continue processing other tasks
                System.err.println("Error loading assignment for task " + task.getId() + ": " + e.getMessage());
            }
        }
        return tasks;
    }

    public List<Task> getTasksByEmployeeId(Long employeeId) {
        List<Task> tasks = taskRepository.findByAssignedEmployeeId(employeeId);
        for (Task task : tasks) {
            taskAssignmentRepository.findByTask(task).ifPresent(a ->
                    task.setAssignedEmployeeName(a.getEmployee().getName()));
        }
        return tasks;
    }

    public List<Task> getTasksForEmployeeBoard(Long employeeId) {
        List<Task> tasks = taskRepository.findByAssignedEmployeeId(employeeId);
        tasks.removeIf(task -> task.getStatus() == TaskStatus.COMPLETED);
        for (Task task : tasks) {
            taskAssignmentRepository.findByTask(task).ifPresent(a ->
                    task.setAssignedEmployeeName(a.getEmployee().getName()));
        }
        return tasks;
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    // ─────────────── employee: mark in-progress ────────────────────

    @Transactional
    public void startTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null && (task.getStatus() == TaskStatus.ASSIGNED || task.getStatus() == TaskStatus.REASSIGNED)) {
            LocalDateTime now = LocalDateTime.now();
            task.setStatus(TaskStatus.IN_PROGRESS);
            task.setStartedTime(now);
            taskRepository.save(task);

            taskAssignmentRepository.findByTask(task).ifPresent(a ->
                    logActivity("TASK_STARTED", a.getEmployee().getName(),
                            "Started working on '" + task.getName() + "'"));
        }
    }

    // ─────────────── employee: submit for verification ─────────────

    @Transactional
    public void submitTask(Long taskId, String submittedFile, LocalDateTime submittedAt, String fileUrl, String remarks) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null && (task.getStatus() == TaskStatus.IN_PROGRESS || task.getStatus() == TaskStatus.REASSIGNED)) {

            LocalDateTime now = submittedAt != null ? submittedAt : LocalDateTime.now();
            task.setStatus(TaskStatus.SUBMITTED);
            task.setSubmittedAt(now);
            if (submittedFile != null) {
                task.setSubmittedFile(submittedFile);
            }
            if (fileUrl != null) {
                task.setFilePath(fileUrl);
            }
            if (remarks != null && !remarks.isBlank()) {
                task.setSubmissionRemarks(remarks);
            }
            taskRepository.save(task);

            TaskAssignment assignment = taskAssignmentRepository.findByTask(task).orElse(null);
            String empName = assignment != null ? assignment.getEmployee().getName() : "Employee";

            String notificationMessage = empName + " submitted task '" + task.getName() + "' for verification.";
            if (fileUrl != null) {
                notificationMessage = "Task submitted by " + empName + " – Click to view: " + fileUrl;
            }

            Notification notification = new Notification(null, "VERIFICATION",
                    notificationMessage, null, false, now);
            notification.setTaskId(taskId);
            notificationRepository.save(notification);

            logActivity("TASK_SUBMITTED", empName,
                    "'" + task.getName() + "' submitted for admin verification");
        }
    }

    // ─────────────── admin: verify & award points ──────────────────

    @Transactional
    public void verifyTask(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null && task.getStatus() == TaskStatus.SUBMITTED) {
            LocalDateTime now = LocalDateTime.now();
            task.setVerifiedAt(now);
            task.setVerifiedTime(now);

            int points = calculatePoints(task);
            task.setPoints(points);
            task.setStatus(TaskStatus.COMPLETED);
            taskRepository.save(task);

            TaskAssignment assignment = taskAssignmentRepository.findByTask(task).orElse(null);
            if (assignment != null) {
                assignment.setCompletedAt(now);
                taskAssignmentRepository.save(assignment);

                Employee emp = assignment.getEmployee();
                emp.setWorkload(Math.max(0.0f, emp.getWorkload() - 20.0f));
                emp.setAvailability(Math.min(100.0f, emp.getAvailability() + 20.0f));
                emp.setFatigueScore(Math.max(0f, emp.getFatigueScore() - 5f));
                employeeRepository.save(emp);

                Gamification g = gamificationRepository.findByEmployeeId(emp.getId()).orElse(null);
                if (g != null) {
                    g.setPoints(g.getPoints() + points);
                    g.setBadges(computeBadge(g.getPoints()));
                    gamificationRepository.save(g);
                }

                Notification n = new Notification(null, "COMPLETION",
                        "Your task '" + task.getName() + "' has been verified and completed! Points awarded: " + points,
                        emp, false, now);
                notificationRepository.save(n);

                logActivity("TASK_COMPLETED", "Admin",
                        "Completed '" + task.getName() + "' for " + emp.getName() + " – points awarded: " + points);

                Notification adminN = new Notification(null, "COMPLETION",
                        emp.getName() + " completed task: " + task.getName(), null, false, now);
                notificationRepository.save(adminN);
            }
        }
    }

    // ─────────────── admin: reject submission ──────────────────────

    @Transactional
    public void rejectSubmission(Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null && task.getStatus() == TaskStatus.SUBMITTED) {
            task.setStatus(TaskStatus.IN_PROGRESS); // Send back to in-progress
            taskRepository.save(task);

            TaskAssignment assignment = taskAssignmentRepository.findByTask(task).orElse(null);
            String empName = assignment != null ? assignment.getEmployee().getName() : "Employee";

            if (assignment != null) {
                Notification n = new Notification(null, "REJECTION",
                        "Your task '" + task.getName() + "' submission was rejected. Please review and resubmit.",
                        assignment.getEmployee(), false, LocalDateTime.now());
                notificationRepository.save(n);
            }

            logActivity("TASK_REJECTED", "Admin",
                    "Rejected submission of '" + task.getName() + "' from " + empName);
        }
    }

    // ─────────────── badge computation ─────────────────────────────

    private String computeBadge(int points) {
        if (points >= 500) return "Platinum";
        if (points >= 300) return "Gold";
        if (points >= 150) return "Silver";
        if (points >= 50)  return "Bronze";
        return "";
    }

    // ─────────────── point calculation (time-based) ────────────────

    private int calculatePoints(Task task) {
        if (task.getSubmittedAt() != null && task.getVerifiedAt() != null) {
            long delayMinutes = Duration.between(task.getSubmittedAt(), task.getVerifiedAt()).toMinutes();
            if (delayMinutes < 60) return 100;
            if (delayMinutes < 180) return 70;
            return 40;
        }
        return 40;
    }

    // ─────────────── leave handling ────────────────────────────────

    @Transactional
    public void handleEmployeeLeave(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp != null) {
            emp.setStatus(EmployeeStatus.ON_LEAVE);
            emp.setWorkload(0f);
            emp.setAvailability(0f);
            employeeRepository.save(emp);

            logActivity("LEAVE_APPROVED", "Admin",
                    emp.getName() + " approved for leave – tasks being reassigned");

            List<TaskAssignment> assignments = taskAssignmentRepository.findByEmployeeId(employeeId);
            for (TaskAssignment assignment : assignments) {
                TaskStatus s = assignment.getTask().getStatus();
                if (s == TaskStatus.ASSIGNED || s == TaskStatus.IN_PROGRESS || s == TaskStatus.REASSIGNED) {
                    Task task = assignment.getTask();
                    task.setStatus(TaskStatus.REASSIGNED);
                    taskRepository.save(task);

                    Notification notification = new Notification(null, "REASSIGNMENT",
                            "Task '" + task.getName() + "' is being reassigned because " + emp.getName() + " is on leave.",
                            null, false, LocalDateTime.now());
                    notificationRepository.save(notification);

                    logActivity("TASK_REASSIGNED", "AI System",
                            "Task '" + task.getName() + "' reassigned due to " + emp.getName() + " leave");

                    allocatePendingTask(task);
                }
            }
        }
    }

    @Transactional
    public void handleEmployeeActive(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp != null) {
            emp.setStatus(EmployeeStatus.ACTIVE);
            emp.setAvailability(100f);
            employeeRepository.save(emp);
            logActivity("STATUS_CHANGED", "Admin", emp.getName() + " status set to Active");
        }
    }

    // ─────────────── manual reassign ───────────────────────────────

    @Transactional
    public void reassignTask(Long taskId, Long employeeId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        Employee newEmp = employeeRepository.findById(employeeId).orElse(null);

        if (task != null && newEmp != null) {
            taskAssignmentRepository.findByTask(task).ifPresent(assignment -> {
                Employee oldEmp = assignment.getEmployee();
                oldEmp.setWorkload(Math.max(0.0f, oldEmp.getWorkload() - 20.0f));
                oldEmp.setAvailability(Math.min(100.0f, oldEmp.getAvailability() + 20.0f));
                employeeRepository.save(oldEmp);
                taskAssignmentRepository.delete(assignment);
            });

            TaskAssignment newAssignment = new TaskAssignment();
            newAssignment.setTask(task);
            newAssignment.setEmployee(newEmp);
            newAssignment.setAssignedAt(LocalDateTime.now());
            taskAssignmentRepository.save(newAssignment);

            task.setStatus(TaskStatus.REASSIGNED);
            taskRepository.save(task);

            newEmp.setWorkload(Math.min(100.0f, newEmp.getWorkload() + 20.0f));
            newEmp.setAvailability(Math.max(0.0f, newEmp.getAvailability() - 20.0f));
            employeeRepository.save(newEmp);

            Notification n = new Notification(null, "REASSIGNMENT",
                    "Task '" + task.getName() + "' has been reassigned to you.", newEmp, false, LocalDateTime.now());
            notificationRepository.save(n);

            logActivity("TASK_REASSIGNED", "Admin",
                    "Task '" + task.getName() + "' manually reassigned to " + newEmp.getName());

            try {
                emailService.sendTaskReassignmentEmail(
                        newEmp.getUser().getEmail(), newEmp.getName(), task.getName());
            } catch (Exception ignored) {}
        }
    }
}
