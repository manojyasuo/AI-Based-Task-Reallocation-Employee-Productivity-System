package com.taskai.controller;

import com.taskai.model.LeaveRequest;
import com.taskai.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private com.taskai.repository.EmployeeRepository employeeRepository;

    @GetMapping("/all")
    public List<Map<String, Object>> getAll() {
        return leaveRequestService.getAllRequests().stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", r.getId());
            map.put("employeeId", r.getEmployee().getId());
            map.put("employeeName", r.getEmployee().getName());
            map.put("startDate", r.getStartDate().toString());
            map.put("endDate", r.getEndDate().toString());
            map.put("reason", r.getReason());
            map.put("status", r.getStatus().toString());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/employee/{id}")
    public List<Map<String, Object>> getByEmployee(@PathVariable Long id) {
        return leaveRequestService.getRequestsByEmployee(id).stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", r.getId());
            map.put("startDate", r.getStartDate().toString());
            map.put("endDate", r.getEndDate().toString());
            map.put("reason", r.getReason());
            map.put("status", r.getStatus().toString());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> payload) {
        try {
            LeaveRequest request = new LeaveRequest();
            request.setStartDate(java.time.LocalDate.parse(payload.get("startDate").toString()));
            request.setEndDate(java.time.LocalDate.parse(payload.get("endDate").toString()));
            request.setReason(payload.get("reason").toString());
            
            Long empId = Long.parseLong(payload.get("employeeId").toString());
            com.taskai.model.Employee emp = employeeRepository.findById(empId).orElseThrow();
            request.setEmployee(emp);
            
            leaveRequestService.requestLeave(request);
            
            return ResponseEntity.ok("Leave applied successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error applying leave");
        }
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        System.out.println("[LeaveRequestController] approveLeave called for id=" + id);
        try {
            leaveRequestService.approveLeave(id);
            return ResponseEntity.ok("Leave approved");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error approving leave: " + e.getMessage());
        }
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        System.out.println("[LeaveRequestController] rejectLeave called for id=" + id);
        try {
            leaveRequestService.rejectLeave(id);
            return ResponseEntity.ok("Leave rejected");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error rejecting leave: " + e.getMessage());
        }
    }
}
