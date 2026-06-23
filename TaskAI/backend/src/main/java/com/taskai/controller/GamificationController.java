package com.taskai.controller;

import com.taskai.model.*;
import com.taskai.repository.*;
import com.taskai.dto.LeaderboardDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    @Autowired private GamificationRepository gamificationRepository;
    @Autowired private TaskAssignmentRepository taskAssignmentRepository;

    @GetMapping("/leaderboard")
    public List<LeaderboardDTO> getLeaderboard() {
        return gamificationRepository.findAll(Sort.by(Sort.Direction.DESC, "points"))
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private LeaderboardDTO convertToDTO(Gamification g) {
        LeaderboardDTO dto = new LeaderboardDTO();
        dto.setId(g.getId());
        dto.setEmployeeId(g.getEmployee().getId());
        dto.setEmployeeName(g.getEmployee().getName());
        dto.setDepartment(g.getEmployee().getDepartment());
        dto.setPoints(g.getPoints());
        dto.setBadge(computeBadge(g.getPoints()));

        // Only count COMPLETED tasks for leaderboard (anti-cheat)
        long completed = taskAssignmentRepository.findByEmployeeId(g.getEmployee().getId())
                .stream().filter(a ->
                        a.getTask().getStatus() == TaskStatus.COMPLETED)
                .count();
        dto.setCompletedTasks(completed);

        long active = taskAssignmentRepository.findByEmployeeId(g.getEmployee().getId())
                .stream().filter(a ->
                        a.getTask().getStatus() == TaskStatus.ASSIGNED ||
                        a.getTask().getStatus() == TaskStatus.IN_PROGRESS)
                .count();
        dto.setActiveTasks(active);

        dto.setWorkload(g.getEmployee().getWorkload());
        dto.setStatus(g.getEmployee().getStatus() != null ? g.getEmployee().getStatus().name() : "ACTIVE");

        return dto;
    }

    private String computeBadge(int points) {
        if (points >= 500) return "Platinum";
        if (points >= 300) return "Gold";
        if (points >= 150) return "Silver";
        if (points >= 50)  return "Bronze";
        return "Newcomer";
    }
}
