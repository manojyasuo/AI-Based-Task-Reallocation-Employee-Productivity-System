package com.taskai.repository;

import com.taskai.model.TaskAssignment;
import com.taskai.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {
    List<TaskAssignment> findByEmployeeId(Long employeeId);
    Optional<TaskAssignment> findByTask(Task task);
}
