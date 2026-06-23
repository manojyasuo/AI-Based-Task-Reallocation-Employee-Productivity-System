package com.taskai.controller;

import com.taskai.model.Task;
import com.taskai.service.TaskService;
import com.taskai.service.AITaskAllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired private TaskService taskService;
    @Autowired private AITaskAllocationService aiTaskAllocationService;
    
    private static final String UPLOAD_DIR = "uploads/tasks/";

    @GetMapping
    public List<Task> getAllTasks(@RequestParam(required = false) Long employeeId) {
        if (employeeId != null) {
            return taskService.getTasksForEmployeeBoard(employeeId);
        }
        return taskService.getAllTasks();
    }

    /** Get tasks for a specific employee by ID (legacy alias) */
    @GetMapping("/employee/{employeeId}")
    public List<Task> getEmployeeTasks(@PathVariable Long employeeId) {
        return taskService.getTasksByEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task, @RequestParam(defaultValue = "true") boolean autoAssign) {
        return ResponseEntity.ok(taskService.createTask(task, autoAssign));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignTask(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Object employeeIdObj = payload.get("employeeId");
        Long employeeId = null;
        if (employeeIdObj instanceof Number) {
            employeeId = ((Number) employeeIdObj).longValue();
        } else if (employeeIdObj instanceof String) {
            try {
                employeeId = Long.parseLong((String) employeeIdObj);
            } catch (NumberFormatException ignored) {}
        }
        System.out.println("[TaskController] assignTask called for task=" + id + " employeeId=" + employeeId + " payload=" + payload);
        if (employeeId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing or invalid employeeId"));
        }
        taskService.assignTask(id, employeeId, "Admin");
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/auto-allocate")
    public ResponseEntity<?> autoAllocate(@PathVariable Long id) {
        com.taskai.model.Task task = taskService.getTaskById(id);
        if (task != null) {
            com.taskai.model.Employee allocated = taskService.allocatePendingTask(task);
            if (allocated != null) {
                return ResponseEntity.ok(Map.of("message", "Allocated to " + allocated.getName()));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Could not find a suitable candidate"));
    }

    /** Employee starts working on a task */
    @PostMapping("/{id}/start")
    public ResponseEntity<?> startTask(@PathVariable Long id) {
        taskService.startTask(id);
        return ResponseEntity.ok().build();
    }

    /** Employee submits task for admin verification with file and remarks */
    @PostMapping("/submit/{taskId}")
    public ResponseEntity<?> submitTaskFile(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "remarks", required = false) String remarks) {
        System.out.println("UPLOAD SUCCESS API HIT");
        System.out.println("Task ID: " + taskId);
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Remarks: " + remarks);
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please attach a PDF or DOCX file."));
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File too large. Maximum size is 5MB."));
            }
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.toLowerCase().matches(".*\\.(pdf|docx)$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unsupported file type. Allowed: .pdf, .docx"));
            }

            String extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            String storedFilename = "task_" + taskId + "_submission" + extension;
            String submittedFilePath = saveUploadedFile(taskId, file, storedFilename);
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/tasks/")
                    .path(storedFilename)
                    .toUriString();

            taskService.submitTask(taskId, submittedFilePath, LocalDateTime.now(), fileUrl, remarks);
            return ResponseEntity.ok(Map.of(
                    "message", "Task submitted successfully",
                    "fileUrl", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    /** Admin verifies submitted task → awards points → marks COMPLETED */
    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyTask(@PathVariable Long id) {
        taskService.verifyTask(id);
        return ResponseEntity.ok(Map.of("message", "Task verified successfully"));
    }

    /** Admin approves submitted task (alias for verify) */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveTask(@PathVariable Long id) {
        taskService.verifyTask(id);
        return ResponseEntity.ok(Map.of("message", "Task approved successfully"));
    }

    /** Admin rejects submission → task goes back to IN_PROGRESS */
    @PostMapping("/{id}/reject-submission")
    public ResponseEntity<?> rejectSubmission(@PathVariable Long id) {
        taskService.rejectSubmission(id);
        return ResponseEntity.ok(Map.of("message", "Task rejected successfully"));
    }

    /** Admin rejects task (alias) */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectTask(@PathVariable Long id) {
        taskService.rejectSubmission(id);
        return ResponseEntity.ok(Map.of("message", "Task rejected successfully"));
    }

    /** Download submitted file for admin verification */
    @GetMapping("/{id}/file")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        if (task == null) {
            System.err.println("Task not found: " + id);
            return ResponseEntity.notFound().build();
        }
        
        if (task.getSubmittedFile() == null) {
            System.err.println("Task " + id + " has no submitted file");
            return ResponseEntity.badRequest().body(Map.of("error", "No submitted file for this task"));
        }
        
        System.out.println("Attempting to download file for task " + id + ": " + task.getSubmittedFile());
        
        try {
            Path filePath = Paths.get(task.getSubmittedFile()).toAbsolutePath();
            System.out.println("Full file path: " + filePath);
            System.out.println("File exists: " + Files.exists(filePath));
            
            if (!Files.exists(filePath)) {
                System.err.println("File not found at: " + filePath);
                return ResponseEntity.badRequest().body(Map.of("error", "File not found on server: " + filePath));
            }
            
            byte[] fileBytes = Files.readAllBytes(filePath);
            String fileName = filePath.getFileName().toString();
            String mimeType = Files.probeContentType(filePath);
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }
            
            System.out.println("Serving file: " + fileName + " (" + fileBytes.length + " bytes, " + mimeType + ")");
            
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Content-Type", mimeType)
                    .body(fileBytes);
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Could not download file: " + e.getMessage()));
        }
    }

    /** AI suggestions for top 3 candidate employees for a task */
    @GetMapping("/{id}/suggestions")
    public List<Map<String, Object>> getSuggestions(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        if (task == null) return Collections.emptyList();

        return aiTaskAllocationService.getTopCandidates(task, 3).stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", e.getId());
            m.put("name", e.getName());
            m.put("department", e.getDepartment());
            m.put("workload", e.getWorkload());
            m.put("availability", e.getAvailability());
            m.put("fatigueScore", e.getFatigueScore());
            m.put("skills", e.getSkills());
            double score = aiTaskAllocationService.calculateScore(e, task);
            m.put("aiScore", Math.round(score * 10.0) / 10.0);
            // Reason breakdown
            m.put("reason", buildReason(e, task, score));
            return m;
        }).collect(Collectors.toList());
    }

    private String buildReason(com.taskai.model.Employee e, Task task, double score) {
        int skillMatch = e.getSkills().getOrDefault(task.getRequiredSkill(), 0);
        return String.format("Skill match: %d%% | Availability: %.0f%% | Workload: %.0f%% | Fatigue: %.0f%%",
                skillMatch, e.getAvailability(), e.getWorkload(), e.getFatigueScore());
    }

    @PostMapping("/{id}/reassign")
    public ResponseEntity<?> reassignTask(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Object employeeIdObj = payload.get("employeeId");
        Long employeeId = null;
        if (employeeIdObj instanceof Number) {
            employeeId = ((Number) employeeIdObj).longValue();
        } else if (employeeIdObj instanceof String) {
            try {
                employeeId = Long.parseLong((String) employeeIdObj);
            } catch (NumberFormatException ignored) {}
        }
        System.out.println("[TaskController] reassignTask called for task=" + id + " employeeId=" + employeeId + " payload=" + payload);
        if (employeeId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing or invalid employeeId"));
        }
        taskService.assignTask(id, employeeId, "Admin (Reassignment)");
        return ResponseEntity.ok().build();
    }

    // ───────────────── File Upload Helper ──────────────────────────

    private String saveUploadedFile(Long taskId, MultipartFile file, String filename) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        Path destination = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("File saved to: " + destination.toAbsolutePath());
        return UPLOAD_DIR + filename;
    }
}
