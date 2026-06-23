package com.taskai.service;

import com.taskai.model.*;
import com.taskai.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private EmailService emailService;

    public List<LeaveRequest> getAllRequests() {
        return leaveRequestRepository.findAll();
    }

    public List<LeaveRequest> getRequestsByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public LeaveRequest requestLeave(LeaveRequest request) {
        request.setStatus(LeaveStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        return leaveRequestRepository.save(request);
    }

    public void approveLeave(Long requestId) {
        System.out.println("[LeaveRequestService] approveLeave invoked for id=" + requestId);
        LeaveRequest request = leaveRequestRepository.findById(requestId).orElse(null);
        if (request == null) {
            throw new RuntimeException("Leave request not found: " + requestId);
        }
        System.out.println("[LeaveRequestService] current status=" + request.getStatus() + " employeeId=" + (request.getEmployee() != null ? request.getEmployee().getId() : "null"));
        request.setStatus(LeaveStatus.APPROVED);
        leaveRequestRepository.save(request);
        System.out.println("[LeaveRequestService] status updated to APPROVED for id=" + requestId);

        // Trigger automatic task reallocation
        taskService.handleEmployeeLeave(request.getEmployee().getId());

        // Send Email
        try {
            emailService.sendLeaveApprovalEmail(request.getEmployee().getUser().getEmail(), request.getEmployee().getName(), "APPROVED");
        } catch (Exception e) {
            System.out.println("[LeaveRequestService] email send failed: " + e.getMessage());
        }
    }

    public void rejectLeave(Long requestId) {
        System.out.println("[LeaveRequestService] rejectLeave invoked for id=" + requestId);
        LeaveRequest request = leaveRequestRepository.findById(requestId).orElse(null);
        if (request == null) {
            throw new RuntimeException("Leave request not found: " + requestId);
        }
        System.out.println("[LeaveRequestService] current status=" + request.getStatus() + " employeeId=" + (request.getEmployee() != null ? request.getEmployee().getId() : "null"));
        request.setStatus(LeaveStatus.REJECTED);
        leaveRequestRepository.save(request);
        System.out.println("[LeaveRequestService] status updated to REJECTED for id=" + requestId);

        // Send Email
        try {
            emailService.sendLeaveApprovalEmail(request.getEmployee().getUser().getEmail(), request.getEmployee().getName(), "REJECTED");
        } catch (Exception e) {
            System.out.println("[LeaveRequestService] email send failed: " + e.getMessage());
        }
    }
}
