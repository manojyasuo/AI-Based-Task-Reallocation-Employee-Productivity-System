package com.taskai.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "gamification")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Gamification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    private Integer points;
    private String badges; // Comma separated values
}
