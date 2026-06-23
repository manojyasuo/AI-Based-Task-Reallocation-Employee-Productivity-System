package com.taskai.service;

import com.taskai.model.*;
import com.taskai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class EmployeeService {

    private static final Logger logger = Logger.getLogger(EmployeeService.class.getName());

    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private GamificationRepository gamificationRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;

    @Transactional
    public Employee saveEmployee(Map<String, Object> data) throws Exception {
        String email = (String) data.get("email");
        String name = (String) data.get("name");
        String department = (String) data.get("department");
        String roleStr = (String) data.getOrDefault("role", "EMPLOYEE");
        String skillsStr = (String) data.getOrDefault("skills", "");
        
        Float workload = data.containsKey("workload") ? Float.valueOf(data.get("workload").toString()) : 0.0f;
        Float availability = data.containsKey("availability") ? Float.valueOf(data.get("availability").toString()) : 100.0f;

        if (userRepository.existsByEmail(email)) {
            throw new Exception("Identity collision: Email already exists in records.");
        }

        String rawPassword = "Employee@123";

        // 1. Create User Identity
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.valueOf(roleStr.toUpperCase()));
        user.setRegistered(false);
        user = userRepository.saveAndFlush(user);

        // 2. Create Employee Profile
        Employee emp = new Employee();
        emp.setUser(user);
        emp.setName(name);
        emp.setDepartment(department);
        emp.setStatus(EmployeeStatus.ACTIVE);
        emp.setWorkload(workload);
        emp.setAvailability(availability);
        emp.setFatigueScore(0.0f);
        
        Map<String, Integer> skillsMap = new HashMap<>();
        if (skillsStr != null && !skillsStr.trim().isEmpty()) {
            for (String p : skillsStr.split(",")) {
                if (!p.trim().isEmpty()) skillsMap.put(p.trim(), 100);
            }
        } else {
            skillsMap.put(department, 100);
        }
        emp.setSkills(skillsMap);
        emp = employeeRepository.saveAndFlush(emp);

        // 3. Initialize Gamification State
        Gamification gamification = new Gamification();
        gamification.setEmployee(emp);
        gamification.setPoints(0);
        gamification.setBadges("");
        gamificationRepository.saveAndFlush(gamification);

        // 4. Trigger Communication Signal (Email)
        try {
            emailService.sendWelcomeEmail(email, name, email, rawPassword);
        } catch (Exception e) {
            logger.severe("Warning: Signal transmission failed: " + e.getMessage());
            // We allow the save to continue even if mail fails, 
            // but we could also throw if the user wants strict mail dependency
            // throw new Exception("Registry link failed due to mail block: " + e.getMessage());
        }

        return emp;
    }
}
