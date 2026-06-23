package com.taskai.controller;

import com.taskai.model.*;
import com.taskai.repository.*;
import com.taskai.service.TaskService;
import com.taskai.service.EmailService;
import com.taskai.service.EmployeeService;
import com.taskai.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private static final Logger logger = Logger.getLogger(EmployeeController.class.getName());

    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskService taskService;
    @Autowired private GamificationRepository gamificationRepository;
    @Autowired private TaskAssignmentRepository taskAssignmentRepository;
    @Autowired private EmployeeService employeeService;

    @GetMapping
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Requirement: POST /api/employees calls service.saveEmployee()
     */
    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Map<String, Object> data) {
        try {
            logger.info("Initializing registry protocol for: " + data.get("name"));
            Employee emp = employeeService.saveEmployee(data);
            logger.info("New Personnel established: " + emp.getName());
            return ResponseEntity.ok(Map.of("message", "Employee created and email sent successfully", "data", convertToDTO(emp)));
        } catch (Exception e) {
            logger.severe("Registry Failure: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Registry failure: " + e.getMessage()));
        }
    }
    
    @GetMapping("/me/{userId}")
    public ResponseEntity<?> getMyProfile(@PathVariable Long userId) {
        return employeeRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private EmployeeDTO convertToDTO(Employee emp) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(emp.getId());
        dto.setName(emp.getName());
        dto.setDepartment(emp.getDepartment());
        dto.setSkills(emp.getSkills());
        dto.setWorkload(emp.getWorkload());
        dto.setAvailability(emp.getAvailability());
        dto.setFatigueScore(emp.getFatigueScore());
        dto.setStatus(emp.getStatus());
        
        gamificationRepository.findByEmployeeId(emp.getId()).ifPresent(g -> dto.setPoints(g.getPoints()));
        
        List<TaskAssignment> assignments = taskAssignmentRepository.findByEmployeeId(emp.getId());
        dto.setActiveTasks(assignments.stream().filter(a -> a.getTask().getStatus() != TaskStatus.COMPLETED).count());
        dto.setCompletedTasks(assignments.stream().filter(a -> a.getTask().getStatus() == TaskStatus.COMPLETED).count());
        
        if (emp.getUser() != null) {
            dto.setEmail(emp.getUser().getEmail());
        }
        
        return dto;
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody EmployeeStatusUpdateDTO dto) {
        employeeRepository.findById(id).ifPresent(e -> {
            if ("ON_LEAVE".equalsIgnoreCase(dto.getStatus())) {
                taskService.handleEmployeeLeave(id);
            } else if ("ACTIVE".equalsIgnoreCase(dto.getStatus())) {
                taskService.handleEmployeeActive(id);
            } else if ("BUSY".equalsIgnoreCase(dto.getStatus())) {
                    e.setStatus(EmployeeStatus.BUSY);
                    employeeRepository.save(e);
            }
        });
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    @PostMapping("/{id}/skills")
    @Transactional
    public ResponseEntity<?> updateSkills(@PathVariable Long id, @RequestBody Map<String, Integer> skills) {
        return employeeRepository.findById(id).map(e -> {
            e.getSkills().putAll(skills);
            employeeRepository.save(e);
            return ResponseEntity.ok(Map.of("message", "Skills updated successfully", "skills", e.getSkills()));
        }).orElse(ResponseEntity.notFound().build());
    }
}
