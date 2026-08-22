# AI-Based Task Reallocation & Employee Productivity System

An intelligent full-stack employee task management and productivity platform that helps organizations assign tasks based on employee skills, availability, workload, and fatigue, while dynamically reallocating tasks when employees become unavailable.

The system also includes productivity analytics, gamification, leave management, notifications, calendar management, and role-based Admin and Employee dashboards.

---

## 🚀 Project Overview

Managing employee tasks manually can result in uneven workloads, delayed tasks, inefficient resource allocation, and difficulty identifying high-performing employees.

This project provides an intelligent task management approach that evaluates employee suitability before assigning a task.

The system considers:

* Employee skill level
* Employee availability
* Current workload
* Fatigue score
* Task-required skill
* Task priority and deadline

When an assigned employee becomes unavailable, pending work can be reassigned to another suitable active employee based on the allocation logic.

The platform also uses gamification to track employee performance through points, rankings, and achievements based on task completion.

---

## 🎯 Objectives

* Automate employee task assignment.
* Allocate tasks to suitable employees based on multiple factors.
* Reduce workload imbalance.
* Reallocate tasks when employees become unavailable.
* Track employee productivity.
* Encourage timely task completion through gamification.
* Help managers identify high-performing employees.
* Provide centralized task, leave, notification, and productivity management.
* Provide separate Admin and Employee experiences.

---

## ✨ Key Features

### 1. 🔐 Authentication & Role-Based Access

The system provides authentication for different user roles.

**Admin**

* Manage employees
* Create and manage tasks
* Monitor productivity
* View analytics
* Manage leave requests
* Monitor employee performance
* Access leaderboard and system information

**Employee**

* View assigned tasks
* Update task status
* Manage personal task information
* Submit leave requests
* View productivity/performance information
* View notifications
* Access calendar-related information

---

### 2. 🤖 Intelligent Task Allocation

The system includes an AI-based/rule-based task allocation service.

Employees are evaluated using:

* Skill Match
* Availability
* Workload
* Fatigue

The implemented suitability formula is:

```text
Score =
(0.4 × Skill Match)
+ (0.3 × Availability)
- (0.2 × Workload)
- (0.1 × Fatigue)
```

The employee with the highest suitability score among eligible active employees is selected for the task.

This approach helps select employees based on multiple work-related factors rather than assigning tasks randomly.

---

### 3. 🔄 Dynamic Task Reallocation

When an employee becomes unavailable, pending work can be reassigned to another suitable employee.

The system considers:

* Employee availability
* Required skill
* Existing workload
* Employee status
* Fatigue level

This helps reduce task delays caused by employee absence or unavailability.

---

### 4. ⚖️ Smart Workload Balancing

The task allocation process considers the employee's current workload before selecting an employee.

Employees with excessive workload receive a lower suitability score, helping distribute tasks more fairly across available employees.

---

### 5. 🏆 Gamification & Employee Productivity

The system includes a gamification-based productivity mechanism.

Employees can earn points based on task completion performance, particularly when tasks are completed on time or ahead of deadlines.

The accumulated performance information can be used to create rankings and identify high-performing employees.

### Benefits

* Encourages timely task completion.
* Provides measurable performance indicators.
* Helps managers identify consistently high-performing employees.
* Supports informed employee selection for important/new projects.
* Creates a transparent performance-oriented environment.

---

### 6. 📊 Productivity Analytics

The application provides analytics-related functionality for monitoring employee and task performance.

Managers can use performance information to understand:

* Task completion
* Employee productivity
* Performance trends
* Work distribution
* Employee rankings

---

### 7. 🏅 Leaderboard

The system includes a leaderboard to display employee performance rankings based on accumulated productivity/gamification scores.

This allows managers to quickly identify employees with stronger task-completion performance.

---

### 8. 📅 Leave Management

Employees can submit leave requests through the system.

The application provides functionality for:

* Leave request submission
* Leave management
* Leave status tracking
* Admin/manager-side leave handling

Employee availability can also affect task allocation and reallocation.

---

### 9. 🔔 Notifications

The system includes notification functionality for communicating important task and employee-related events.

It also contains an email service on the backend for automated email-related communication.

---

### 10. 📆 Calendar

The frontend includes a calendar module for managing and viewing schedule-related information.

The application uses React Calendar for calendar functionality.

---

### 12. 📈 Admin Dashboard

The Admin dashboard provides a centralized view for managing the workforce and monitoring system activities.

Admin functionality includes areas such as:

* Employee management
* Task management
* Analytics
* Productivity monitoring
* Leave management
* Notifications
* Performance/leaderboard information

---

### 13. 👨‍💻 Employee Dashboard

Employees have a dedicated dashboard for accessing their work-related information.

Employees can manage and view:

* Assigned tasks
* Task status
* Leave requests
* Notifications
* Calendar
* Productivity/performance information

---

## 🧠 Task Allocation Algorithm

The core allocation logic evaluates eligible active employees.

### Input

```text
Employee:
    Skills
    Availability
    Workload
    Fatigue Score
    Status

Task:
    Required Skill
```

### Process

```text
1. Retrieve employees.
2. Filter employees with ACTIVE status.
3. Compare the required task skill with employee skills.
4. Evaluate employee availability.
5. Evaluate current workload.
6. Evaluate fatigue score.
7. Calculate suitability score.
8. Compare eligible employees.
9. Select the employee with the highest score.
```

### Output

```text
Best-suited available employee
```

The backend implements this logic in `AITaskAllocationService`.

---

## 🏆 Gamification Workflow

```text
Task Assigned
      ↓
Employee Works on Task
      ↓
Task Completed
      ↓
Completion Time Evaluated
      ↓
Performance Points Awarded
      ↓
Employee Score Updated
      ↓
Leaderboard Updated
      ↓
Manager Can Identify High Performers
```

The gamification mechanism provides a measurable way to recognize employee task-completion performance.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │        User            │
                    │ Admin / Employee       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    React Frontend       │
                    │                         │
                    │ Dashboards              │
                    │ Tasks                   │
                    │ Calendar                │
                    │ Analytics               │
                    │ Leaderboard             │
                    │ Leave Management        │
                    │ Notifications           │
                    │ Chatbot                 │
                    └────────────┬────────────┘
                                 │
                           REST APIs
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Spring Boot Backend   │
                    │                         │
                    │ Controllers             │
                    │ Services                │
                    │ DTOs                    │
                    │ Security                │
                    │ Repositories            │
                    │ Business Logic           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       MySQL             │
                    │       Database           │
                    └─────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Vite
* React Router
* Axios
* React Calendar
* Chart.js
* Recharts
* Framer Motion
* Lucide React

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* REST APIs
* Maven

### Database

* MySQL

### Development Tools

* Git
* GitHub
* Visual Studio Code
* Eclipse/IDE
* Maven
* npm

---

## 📂 Project Structure

```text
AI-Based-Task-Reallocation-Employee-Productivity-System/
│
├── TaskAI/
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/com/taskai/
│   │   │       │   ├── config/
│   │   │       │   ├── controller/
│   │   │       │   ├── dto/
│   │   │       │   ├── model/
│   │   │       │   ├── repository/
│   │   │       │   ├── security/
│   │   │       │   ├── service/
│   │   │       │   └── TaskAiApplication.java
│   │   │       │
│   │   │       └── resources/
│   │   │
│   │   └── pom.xml
│   │
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.jsx
│       │
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

## 📋 Backend Modules

The backend is organized using a layered Spring Boot architecture.

### Controllers

* `AuthController`
* `EmployeeController`
* `TaskController`
* `AnalyticsController`
* `GamificationController`
* `LeaveRequestController`
* `NotificationController`

### Services

* `AITaskAllocationService`
* `AiAssignmentService`
* `EmployeeService`
* `TaskService`
* `LeaveRequestService`
* `EmailService`
* `DataSeeder`

This structure separates API handling from business logic and data-access responsibilities.

---

## 🖥️ Frontend Pages

The React frontend contains pages/components for:

* Landing Page
* Login
* Sign Up
* Admin Dashboard
* Employee Dashboard
* Employees
* Tasks
* Analytics
* Calendar
* Leaderboard
* Leave Management
* Leave Requests
* Notifications

Additional reusable components include:

* ChatBot
* Sidebar
* StatCard

---

## 🔄 Application Workflow

```text
Admin Login
    ↓
Admin Dashboard
    ↓
Create / Manage Employees
    ↓
Create Task
    ↓
Task Allocation Algorithm
    ↓
Suitable Employee Selected
    ↓
Employee Receives Task
    ↓
Employee Completes Task
    ↓
Productivity / Gamification Updated
    ↓
Leaderboard & Analytics
```

### Employee Unavailability Workflow

```text
Employee Becomes Unavailable
          ↓
Assigned/Pending Task Identified
          ↓
Active Employees Evaluated
          ↓
Skills + Availability + Workload + Fatigue
          ↓
Suitability Score Calculated
          ↓
Best Available Employee Selected
          ↓
Task Reallocated
```

---

## 🔑 Key Design Principles

### Intelligent Decision Making

Instead of assigning tasks only according to availability, the system considers multiple employee attributes.

### Fair Work Distribution

Workload is considered during task assignment to reduce excessive concentration of tasks on individual employees.

### Performance Visibility

Gamification and analytics provide measurable indicators that help managers understand employee performance.

### Dynamic Adaptation

The system can respond to employee availability changes by supporting task reallocation.

---

## ⚙️ Installation & Setup

### Prerequisites

Install the following:

* Java JDK
* Maven
* Node.js
* npm
* MySQL
* Git

---

## 🗄️ Database Setup

1. Install and start MySQL.
2. Create a database for the application.
3. Configure the database username, password, and connection URL in the Spring Boot application's configuration.
4. Start the backend.

Example:

```sql
CREATE DATABASE taskai;
```

Update the database configuration according to your local environment.

> Do not commit real database passwords, API keys, email passwords, or other secrets to GitHub.

---

## ▶️ Run the Backend

Navigate to the backend directory:

```bash
cd TaskAI/backend
```

Run:

```bash
mvn spring-boot:run
```

The backend will start using the Spring Boot configuration in the project.

---

## ▶️ Run the Frontend

Open another terminal:

```bash
cd TaskAI/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the Vite development URL shown in the terminal.

---

## 🔗 API Communication

The React frontend communicates with the Spring Boot backend through REST APIs.

Axios is used on the frontend for HTTP communication.

The backend exposes controller endpoints for areas such as:

* Authentication
* Employees
* Tasks
* Analytics
* Gamification
* Leave requests
* Notifications

---

## 🔒 Security

The project contains a dedicated security package and authentication controller for application access control.

For production deployment, additional security hardening should be applied, including:

* Secure password management
* Environment variables for secrets
* HTTPS
* Strong authentication configuration
* Input validation
* Proper authorization checks
* Production database configuration

---

## 📊 Future Enhancements

Possible future improvements include:

* Machine-learning-based employee performance prediction
* More advanced workload forecasting
* Automated fatigue prediction
* Advanced recommendation models
* Real-time notifications using WebSockets
* Docker-based deployment
* Cloud deployment
* CI/CD pipeline
* Advanced reporting and export
* More sophisticated gamification and reward mechanisms
* AI-powered project staffing recommendations

---

## 👨‍💻 Author

**Manoj K**

B.Tech Information Technology
Full Stack Developer

GitHub:
https://github.com/manojyasuo

Project Repository:
https://github.com/manojyasuo/AI-Based-Task-Reallocation-Employee-Productivity-System

---

## 📌 Project Highlights

* Intelligent task allocation
* Skill-based employee selection
* Availability-aware assignment
* Workload-aware assignment
* Fatigue-aware scoring
* Dynamic task reallocation
* Employee productivity tracking
* Gamification and leaderboard
* Leave management
* Analytics dashboard
* Admin and Employee dashboards
* REST API-based architecture
* React + Spring Boot full-stack implementation

---

## 📄 Project Status

**Status:** Completed / Academic Project

This project demonstrates the design and implementation of an intelligent full-stack employee task allocation and productivity management platform using Java Spring Boot, React.js, and MySQL.
