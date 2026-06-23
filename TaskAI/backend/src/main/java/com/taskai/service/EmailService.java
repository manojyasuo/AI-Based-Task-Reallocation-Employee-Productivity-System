package com.taskai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendTaskAssignmentEmail(String to, String employeeName, String taskName, String deadline) {
        String body = String.format("Hello %s,\n\nA new task has been assigned to you.\nTask: %s\nDeadline: %s\n\nBest regards,\nTaskAI Team",
                employeeName, taskName, deadline);
        sendEmail(to, "New Task Assigned", body);
    }

    public void sendTaskReassignmentEmail(String to, String employeeName, String taskName) {
        String body = String.format("Hello %s,\n\nA task (%s) has been reassigned to you.\n\nBest regards,\nTaskAI Team",
                employeeName, taskName);
        sendEmail(to, "Task Reassigned", body);
    }

    public void sendLeaveApprovalEmail(String to, String employeeName, String status) {
        String body = String.format("Hello %s,\n\nYour leave request has been %s.\n\nBest regards,\nTaskAI Team",
                employeeName, status.toLowerCase());
        sendEmail(to, "Leave Request Update", body);
    }

    public void sendWelcomeEmail(String to, String name, String email, String password) {
        String subject = "Welcome to TaskAI System";
        String body = String.format(
            "Hello %s,\n\n" +
            "You have been successfully added as an employee in TaskAI.\n\n" +
            "Login Details:\n" +
            "Email: %s\n" +
            "Password: %s\n\n" +
            "Please log in and start working on your assigned tasks.\n\n" +
            "Regards,\n" +
            "Admin", 
            name, email, password
        );
        sendEmail(to, subject, body);
    }
}
