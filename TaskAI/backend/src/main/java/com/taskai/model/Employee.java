package com.taskai.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;

@Entity
@Table(name = "employees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
    
    private String name;
    private String department;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "employee_skills", joinColumns = @JoinColumn(name = "employee_id"))
    @MapKeyColumn(name = "skill_name")
    @Column(name = "skill_percentage")
    private Map<String, Integer> skills;
    
    private Float workload; // percentage
    private Float availability; // percentage
    private Float fatigueScore; // 0.0 - 100.0 (High value = more fatigued)
    
    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;

    
}

