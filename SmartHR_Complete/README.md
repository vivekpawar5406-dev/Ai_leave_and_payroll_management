# PeoplePilot — Smart HR & Payroll Management System

A student-project starter with three role views, employee management, leave requests and decisions, attendance records, demo payroll calculation, printable payslips, and a MySQL-backed Spring Boot REST API.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Java 25 (LTS), Spring Boot 3.5.16, REST, JDBC
- Database: MySQL 8+

## 1. Database setup
Install and start MySQL Server. In MySQL Workbench, run:

```sql
CREATE DATABASE IF NOT EXISTS smart_hr;
```

Edit `backend/src/main/resources/application.properties`. Set your MySQL username and password. Default username is `root`; the password placeholder is `change_me`. Alternatively, set environment variables `DB_USERNAME` and `DB_PASSWORD` before starting the backend.

Spring executes `schema.sql` and `data.sql` on startup. The sample inserts use `INSERT IGNORE`, so they won't duplicate records every time.

## 2. Start backend
Install JDK 25 and Maven. In VS Code, open the `backend` folder (or open a terminal inside it) and run:

```bash
mvn spring-boot:run
```

The API runs at `http://localhost:8081`. Check `http://localhost:8081/api/health` and expect `{"status":"ok","service":"PeoplePilot API"}`.

## 3. Start frontend
In VS Code, open `frontend/index.html`, right-click, choose **Open with Live Server**. If Live Server chooses port 5500, the API's CORS settings allow it. If it chooses a different port, add that origin to `@CrossOrigin` in `SmartHrApplication.java` and restart the backend.

Do not open the HTML using `file://`; use Live Server.

## API endpoints
- `GET /api/health`
- `GET, POST /api/employees`; `PUT, DELETE /api/employees/{id}`
- `GET, POST /api/leaves`; `PATCH /api/leaves/{id}/status` with `{"status":"APPROVED"}` or `{"status":"REJECTED"}`
- `GET, POST /api/attendance`
- `GET, POST /api/payroll`

## Demo accounts / role views
Use the role dropdown in the top-right to view HR Admin, Manager, and Employee layouts. Sample employee view uses `employee@demo.com`. This is a **role-view demo only**, not secure authentication: users can switch roles and the API does not enforce authorization. Do not use real personal data or deploy publicly as-is.

## Important project limitations
- Payroll arithmetic is illustrative only; it is not statutory Indian payroll, TDS, PF, ESI, or tax-compliance software. HR should verify every amount.
- Employee leave is counted as calendar days in this version, not working days/holidays.
- Document upload currently demonstrates file selection only; it does not persist files or perform OCR.
- Smart alerts are rule-based demo text, not AI prediction. AI document scanning and prediction can be added later.
- Before production: implement Spring Security and role-based authorization, input validation, password hashing, audit logs, privacy protections, backups, and secure document storage.
