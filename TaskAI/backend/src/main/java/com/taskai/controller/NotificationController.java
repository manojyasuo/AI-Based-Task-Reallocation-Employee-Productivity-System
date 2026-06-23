package com.taskai.controller;

import com.taskai.model.Notification;
import com.taskai.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/admin")
    public List<Notification> getAdminNotifications() {
        return notificationRepository.findByEmployeeIsNullOrderByIdDesc();
    }

    @GetMapping("/employee/{empId}")
    public List<Notification> getEmployeeNotifications(@PathVariable Long empId) {
        return notificationRepository.findByEmployeeIdOrderByIdDesc(empId);
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
