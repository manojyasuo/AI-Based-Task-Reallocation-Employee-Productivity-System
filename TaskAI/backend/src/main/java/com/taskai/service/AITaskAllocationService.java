package com.taskai.service;

import com.taskai.model.Employee;
import com.taskai.model.EmployeeStatus;
import com.taskai.model.Task;
import com.taskai.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AITaskAllocationService {

    @Autowired
    private EmployeeRepository employeeRepository;

    private static final double ALPHA = 0.4; // SkillMatch weight
    private static final double BETA = 0.3;  // Availability weight
    private static final double GAMMA = 0.2; // Workload weight
    private static final double DELTA = 0.1; // Fatigue weight

    public Employee allocateTask(Task task) {
        List<Employee> eligibleEmployees = getEligibleEmployees();
        if (eligibleEmployees.isEmpty()) return null;

        return eligibleEmployees.stream()
                .max((e1, e2) -> Double.compare(calculateScore(e1, task), calculateScore(e2, task)))
                .orElse(null);
    }

    public List<Employee> getTopCandidates(Task task, int limit) {
        return getEligibleEmployees().stream()
                .sorted((e1, e2) -> Double.compare(calculateScore(e2, task), calculateScore(e1, task)))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<Employee> getEligibleEmployees() {
        return employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    public double calculateScore(Employee employee, Task task) {
        // 1. Skill Match (0-100)
        String reqSkill = task.getRequiredSkill();
        Integer skillLevel = employee.getSkills().getOrDefault(reqSkill, 0);
        double skillMatch = skillLevel; 

        // 2. Availability (0-100)
        double availability = employee.getAvailability();

        // 3. Workload (0-100)
        double workload = employee.getWorkload();
        
        // 4. Fatigue (0-100)
        double fatigue = employee.getFatigueScore() != null ? employee.getFatigueScore() : 0.0;

        // Formula: Score = α × SkillMatch + β × Availability − γ × Workload − δ × Fatigue
        return (ALPHA * skillMatch) + (BETA * availability) - (GAMMA * workload) - (DELTA * fatigue);
    }
}
