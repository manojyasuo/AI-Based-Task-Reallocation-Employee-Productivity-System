package com.taskai.service;

import com.taskai.model.Employee;
import com.taskai.model.Task;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiAssignmentService {

    public Employee assignTask(List<Employee> employees, Task task) {

        Employee best = null;
        double bestScore = -1;

        for (Employee emp : employees) {

            double score = 0;

            // 🔥 Less workload = better
            score += (100 - emp.getWorkload());

            // 🔥 More availability = better
            score += emp.getAvailability();

            // 🔥 Skill match
            if (emp.getSkills() != null && task.getRequiredSkill() != null) {
                if (emp.getSkills().containsKey(task.getRequiredSkill().toUpperCase())) {
                    score += 50;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                best = emp;
            }
        }

        return best;
    }
}