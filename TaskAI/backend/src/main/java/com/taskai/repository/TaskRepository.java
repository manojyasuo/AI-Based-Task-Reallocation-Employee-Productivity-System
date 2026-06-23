package com.taskai.repository;

import com.taskai.model.Task;
import com.taskai.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByAssignedEmployeeId(Long employeeId);
    List<Task> findByAssignedEmployeeIdAndStatus(Long employeeId, TaskStatus status);
}
