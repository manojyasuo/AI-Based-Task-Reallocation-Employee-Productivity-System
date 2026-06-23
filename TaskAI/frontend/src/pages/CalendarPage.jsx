import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarPage.css";
import api from "../api/axios";

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===== FILTER TASKS BY DATE =====
  const getTasksForDate = (value) => {
    return tasks.filter(
      (task) =>
        task.deadline &&
        new Date(task.deadline + "T00:00:00").toDateString() ===
          value.toDateString()
    );
  };

  // ===== DEADLINE STATUS =====
  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const due = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diff < 0)
      return { type: "overdue", message: `❌ Overdue by ${Math.abs(diff)} day(s)` };
    if (diff === 0)
      return { type: "today", message: "⚡ Due Today" };
    if (diff === 1)
      return { type: "tomorrow", message: "⏳ Due Tomorrow" };
    if (diff <= 3)
      return { type: "urgent", message: `⚠ Due in ${diff} days` };

    return { type: "normal", message: `📅 Due in ${diff} days` };
  };

  return (
    <div className="calendar-page">

      <h1 className="calendar-title">📅 Task Calendar</h1>

      {/* ===== CALENDAR ===== */}
      <Calendar
        onChange={setDate}
        value={date}
        className="custom-calendar"
        tileContent={({ date }) => {
          const dayTasks = getTasksForDate(date);

          return dayTasks.length > 0 ? (
            <div className="dot-container">
              {dayTasks.map((t, i) => (
                <span
                  key={i}
                  className="dot"
                  style={{
                    background:
                      t.priority === 3
                        ? "#ef4444"
                        : t.priority === 2
                        ? "#f59e0b"
                        : "#00d2ff"
                  }}
                />
              ))}
            </div>
          ) : null;
        }}
      />

      {/* ===== TASK LIST ===== */}
      <div className="task-section">
  <h2>Tasks on {date.toDateString()}</h2>

  {getTasksForDate(date).length === 0 ? (
    <p className="no-task">No tasks</p>
  ) : (
    getTasksForDate(date).map((task) => {
      const status = getDeadlineStatus(task.deadline);

      // 🔥 FIX: Proper assignment type detection
      const getAssignmentType = () => {
        if (task.assignmentType === "AI") return "🤖 AI Assigned";
        if (task.assignmentType === "MANUAL") return "👨‍💼 Manual";

        // fallback logic (for old data)
        if (task.assignedBy === "SYSTEM") return "🤖 AI Assigned";

        return "👨‍💼 Manual";
      };

      return (
        <div
          key={task.id}
          className="task-card"
          onClick={() => setSelectedTask(task)}
        >

          <h3>{task.name}</h3>
          <p>{task.description}</p>

          <p>📅 {task.deadline}</p>
          <p>📌 {task.status}</p>

          <p>
            👤 {task.assignedEmployeeName || "Not Assigned"}
          </p>

          {/* 🔥 FIXED LINE */}
          <p>⚙ {getAssignmentType()}</p>

          <p>
            📊 {
              task.status === "COMPLETED"
                ? "✅ Done"
                : task.status === "IN_PROGRESS"
                ? "🔄 In Progress"
                : "⏳ Pending"
            }
          </p>

          <p className={`status ${status.type}`}>
            {status.message}
          </p>

        </div>
      );
    })
  )}
</div>

      {/* ===== MODAL ===== */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>{selectedTask.name}</h2>
            <p>{selectedTask.description}</p>

            <p>📅 {selectedTask.deadline}</p>
            <p>📌 {selectedTask.status}</p>

            <p>
              👤 {selectedTask.assignedEmployeeName || "Not Assigned"}
            </p>

            <p>
              ⚙ {selectedTask.assignmentType === "AI"
                ? "🤖 AI Assigned"
                : "👨‍💼 Manual"}
            </p>

            {/* EDIT DEADLINE */}
            <input
              type="date"
              value={selectedTask.deadline}
              onChange={(e) =>
                setSelectedTask({
                  ...selectedTask,
                  deadline: e.target.value
                })
              }
            />

            <div className="modal-actions">

              <button
                onClick={async () => {
                  await api.put(`/api/tasks/${selectedTask.id}`, selectedTask);
                  setSelectedTask(null);
                  fetchTasks();
                }}
              >
                💾 Save
              </button>

              <button
                onClick={async () => {
                  await api.put(`/api/tasks/${selectedTask.id}`, {
                    ...selectedTask,
                    status: "COMPLETED"
                  });
                  setSelectedTask(null);
                  fetchTasks();
                }}
              >
                ✅ Complete
              </button>

              <button onClick={() => setSelectedTask(null)}>
                ❌ Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarPage;