# AI Leave & Payroll Management System (PeoplePilot Pro)

A modern, full-stack Human Resource Management System (HRMS) built with Spring Boot, MySQL, and an interactive futuristic frontend.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC)
- **HR Administrator**: Full company oversight, workforce directory management, leave approvals/rejections, salary and compensation registers, and company payroll simulation.
- **Team Manager**: Team workforce view, pending leave reviews, and shift attendance oversight.
- **Employee**: Personal dashboard, leave balance tracking, time-off applications, attendance clock-in, and private printable payslips. (Colleague salaries and sensitive metrics are strictly confidential and hidden).

### 2. 📋 Interactive Leaves Kanban Board
- Visual status pipeline: **Pending Review**, **Approved**, and **Rejected**.
- Drag-and-drop workflow with instant backend status synchronization.
- Automatic leave balance deduction upon approval.

### 3. ⏱️ Attendance & Shift Tracking
- 1-Click Clock-In capability for immediate daily shift logging.
- Status filters: Present, Remote, Absent, Leave.
- Real-time timestamped database logs.

### 4. 💰 Payroll & Printable Payslips
- Automated earnings & deductions calculation (Basic Salary, Allowances, Statutory Deductions, Withholding Tax, Net Salary).
- Corporate formatted printable payslips with print-to-PDF support.
- Dynamic workforce expansion & salary hike scenario simulator for HR.

### 5. ✨ Neural Copilot AI & Audio FX
- Natural language query engine for workforce intelligence (attrition risk, department headcount, pending leaves).
- Web Audio API procedural cyber sound synthesizers.
- Ambient constellation particle canvas background with Dark/Light theme toggles.
- Keyboard Command HUD (`Ctrl+K`) for rapid navigation and search.

---

## 🛠️ Tech Stack

- **Backend**: Java 17+, Spring Boot, JDBC Template, REST API
- **Database**: MySQL 8.0+
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties (Zero heavy dependencies)
- **Audio & Visuals**: Web Audio API, Canvas 2D API, Web Speech API

---

## 🚀 Quick Start Guide

### 1. Database Setup
Ensure MySQL is running on port `3306`:
```sql
CREATE DATABASE IF NOT EXISTS smart_hr;
```
Configure your credentials in `SmartHR_Complete/backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_hr?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

### 2. Run Backend (Spring Boot)
```bash
cd SmartHR_Complete/backend
mvn spring-boot:run
```
The backend API and unified static application will start at **http://localhost:8081**.

### 3. Run Frontend Server (Optional)
```bash
cd SmartHR_Complete/frontend
node server.js
```
The live frontend server will run at **http://127.0.0.1:5500**.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **HR Administrator** | `admin@peoplepilot.com` | `admin123` |
| **Team Manager** | `manager@peoplepilot.com` | `manager123` |
| **Software Engineer** | `employee@demo.com` | `employee123` |
| **HR Executive** | `priya@demo.com` | `priya123` |
