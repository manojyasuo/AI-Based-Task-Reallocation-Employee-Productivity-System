package com.taskai.service;

import com.taskai.model.*;
import com.taskai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired UserRepository userRepository;
    @Autowired EmployeeRepository employeeRepository;
    @Autowired GamificationRepository gamificationRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired TaskService taskService;
    @Autowired TaskRepository taskRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@company.com")) {
            User admin = new User();
            admin.setEmail("admin@company.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setRegistered(true);
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("arun@company.com")) {
            // Tamil Nadu Employee Dataset
            // Format: name | department | skills (skill:pct,...) | workload:avail:points:fatigue | status | email
            String[][] empData = {
                // Male employees
                {"Arun Kumar",      "Engineering",  "React:90,Node.js:85,JavaScript:88",   "40:90:250:20",  "ACTIVE",    "arun@company.com"},
                {"Karthik Raj",     "Backend",      "Java:92,Spring Boot:88,SQL:82",        "55:75:180:35",  "ACTIVE",    "karthik@company.com"},
                {"Vignesh S",       "Frontend",     "React:85,TypeScript:80,CSS:90",        "35:85:310:15",  "ACTIVE",    "vignesh@company.com"},
                {"Praveen Kumar",   "DevOps",       "Docker:88,Kubernetes:85,AWS:80",       "60:70:140:45",  "ACTIVE",    "praveen@company.com"},
                {"Sathish Kumar",   "Data Science", "Python:95,TensorFlow:88,ML:90",        "30:95:420:10",  "ACTIVE",    "sathish@company.com"},
                {"Surya Prakash",   "Cloud",        "AWS:90,Azure:78,Terraform:82",         "50:80:200:30",  "ACTIVE",    "surya@company.com"},
                {"Gokul Raj",       "Security",     "Cybersecurity:88,Penetration:82",      "45:85:230:25",  "ACTIVE",    "gokul@company.com"},
                {"Dinesh Kumar",    "Analytics",    "PowerBI:90,Tableau:85,SQL:88",         "55:75:160:40",  "BUSY",      "dinesh@company.com"},
                {"Ramesh B",        "QA",           "Testing:92,Selenium:88,Jest:80",       "40:90:195:20",  "ACTIVE",    "ramesh@company.com"},
                {"Lokesh B",        "Mobile",       "Flutter:88,Dart:85,Android:80",        "60:65:130:50",  "ON_LEAVE",  "lokesh@company.com"},
                // Female employees
                {"Priya S",         "Design",       "Figma:95,UI:90,UX:88",                "35:90:290:15",  "ACTIVE",    "priya@company.com"},
                {"Divya R",         "Backend",      "Java:85,Spring Boot:82,Hibernate:80",  "50:80:170:35",  "ACTIVE",    "divya@company.com"},
                {"Keerthana M",     "Data Science", "Python:92,Pandas:90,NumPy:88",         "40:90:260:20",  "ACTIVE",    "keerthana@company.com"},
                {"Nandhini K",      "Frontend",     "Angular:90,TypeScript:88,HTML:95",     "45:85:215:25",  "ACTIVE",    "nandhini@company.com"},
                {"Harini V",        "DevOps",       "CI/CD:88,Jenkins:85,Linux:90",         "55:75:150:40",  "ACTIVE",    "harini@company.com"},
                {"Anitha R",        "Analytics",    "Excel:90,PowerBI:85,Python:80",        "35:90:280:15",  "ACTIVE",    "anitha@company.com"},
                {"Meena S",         "QA",           "Automation:90,Selenium:88,Cypress:82", "50:80:190:30",  "ACTIVE",    "meena@company.com"},
                {"Kavya R",         "Engineering",  "React:88,Redux:85,GraphQL:80",          "45:85:225:22",  "ACTIVE",    "kavya@company.com"},
                {"Deepika S",       "ML",           "TensorFlow:90,PyTorch:85,NLP:82",      "60:65:110:55",  "BUSY",      "deepika@company.com"},
                {"Gayathri M",      "Design",       "Adobe XD:92,Illustrator:88,CSS:90",   "30:95:380:10",  "ACTIVE",    "gayathri@company.com"},
            };

            for (String[] data : empData) {
                User user = new User();
                user.setEmail(data[5]);
                user.setPassword(passwordEncoder.encode("Employee@123"));
                user.setRole(Role.EMPLOYEE);
                user.setRegistered(true);
                userRepository.save(user);

                Employee emp = new Employee();
                emp.setUser(user);
                emp.setName(data[0]);
                emp.setDepartment(data[1]);

                Map<String, Integer> skills = new HashMap<>();
                for (String s : data[2].split(",")) {
                    String[] sp = s.split(":");
                    if (sp.length == 2) skills.put(sp[0].trim(), Integer.parseInt(sp[1].trim()));
                }
                emp.setSkills(skills);

                String[] metrics = data[3].split(":");
                emp.setWorkload(Float.parseFloat(metrics[0]));
                emp.setAvailability(Float.parseFloat(metrics[1]));
                emp.setFatigueScore(Float.parseFloat(metrics[3]));
                emp.setStatus(EmployeeStatus.valueOf(data[4]));
                employeeRepository.save(emp);

                Gamification gamification = new Gamification();
                gamification.setEmployee(emp);
                int pts = Integer.parseInt(metrics[2]);
                gamification.setPoints(pts);
                gamification.setBadges(computeBadge(pts));
                gamificationRepository.save(gamification);
            }

            // 15 Diverse Tasks
            String[][] taskData = {
                {"Build React Dashboard",       "Create interactive analytics dashboard UI",        "React",            "2", "2026-03-30"},
                {"Design System API",           "RESTful API for employee management",              "Java",             "3", "2026-03-28"},
                {"Setup K8s Cluster",           "Kubernetes cluster for microservices",             "Kubernetes",       "3", "2026-03-25"},
                {"ML Model Training",           "Train classification model for task allocation",   "TensorFlow",       "3", "2026-04-05"},
                {"Security Audit",              "Full vulnerability assessment and pen-test",       "Cybersecurity",    "3", "2026-03-26"},
                {"Figma Prototype v2",          "New employee portal UI/UX redesign",               "Figma",            "2", "2026-04-02"},
                {"PowerBI Reports",             "Monthly KPI and performance dashboards",           "PowerBI",          "2", "2026-04-01"},
                {"Docker Migration",            "Containerize legacy Spring Boot services",         "Docker",           "2", "2026-03-29"},
                {"Selenium Test Suite",         "Automated regression testing for all modules",     "Selenium",         "1", "2026-04-07"},
                {"Angular Component Library",   "Shared UI component library for frontend teams",   "Angular",          "1", "2026-04-10"},
                {"AWS Infrastructure IaC",      "Terraform scripts for AWS cloud infra",            "AWS",              "3", "2026-03-27"},
                {"Python ETL Pipeline",         "Data pipeline for analytics warehouse",            "Python",           "2", "2026-04-03"},
                {"Flutter Mobile App",          "Employee self-service mobile application",         "Flutter",          "2", "2026-04-08"},
                {"NLP Chatbot Integration",     "Internal IT helpdesk chatbot with NLP",            "NLP",              "2", "2026-04-06"},
                {"CI/CD Pipeline Setup",        "GitHub Actions → Docker → K8s deployment pipeline","CI/CD",            "3", "2026-03-31"},
            };

            for (String[] t : taskData) {
                Task task = new Task();
                task.setName(t[0]);
                task.setDescription(t[1]);
                task.setRequiredSkill(t[2]);
                task.setPriority(Integer.parseInt(t[3]));
                task.setDeadline(LocalDate.parse(t[4]));
                taskService.createTask(task, true);
            }
        }
    }

    private String computeBadge(int points) {
        if (points >= 500) return "Platinum";
        if (points >= 300) return "Gold";
        if (points >= 150) return "Silver";
        if (points >= 50)  return "Bronze";
        return "";
    }
}
