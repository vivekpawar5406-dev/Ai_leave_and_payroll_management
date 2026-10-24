package com.smarthr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.*;
import java.time.*;
import java.time.temporal.ChronoUnit;

@SpringBootApplication
public class SmartHrApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartHrApplication.class, args);
    }

    @RestController
    @RequestMapping("/api")
    @CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
    static class ApiController {
        private final JdbcTemplate db;

        ApiController(JdbcTemplate db) {
            this.db = db;
        }

        private Map<String, Object> one(String sql, Object... args) {
            List<Map<String, Object>> r = db.queryForList(sql, args);
            if (r.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
            return r.get(0);
        }

        private long num(Map<String, Object> m, String k) {
            try {
                return Long.parseLong(String.valueOf(m.get(k)));
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or missing field: " + k);
            }
        }

        private String str(Map<String, Object> m, String k) {
            Object v = m.get(k);
            if (v == null || String.valueOf(v).isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing field: " + k);
            }
            return String.valueOf(v).trim();
        }

        @ExceptionHandler(ResponseStatusException.class)
        public org.springframework.http.ResponseEntity<Map<String, Object>> handleStatusException(ResponseStatusException ex) {
            String msg = ex.getReason() != null ? ex.getReason() : ex.getMessage();
            return org.springframework.http.ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of("status", "error", "message", msg, "statusCode", ex.getStatusCode().value()));
        }

        @GetMapping("/health")
        Map<String, Object> health() {
            return Map.of("status", "ok", "service", "PeoplePilot API", "version", "2.4.0");
        }

        @GetMapping("/stats")
        Map<String, Object> stats() {
            Integer totalEmployees = db.queryForObject("SELECT COUNT(*) FROM employees", Integer.class);
            Integer activeEmployees = db.queryForObject("SELECT COUNT(*) FROM employees WHERE status='ACTIVE'", Integer.class);
            Integer pendingLeaves = db.queryForObject("SELECT COUNT(*) FROM leave_requests WHERE status='PENDING'", Integer.class);
            Double totalPayroll = db.queryForObject("SELECT COALESCE(SUM(net_salary),0) FROM payroll", Double.class);
            Integer attendanceToday = db.queryForObject("SELECT COUNT(*) FROM attendance WHERE work_date = CURRENT_DATE", Integer.class);
            return Map.of(
                "totalEmployees", totalEmployees != null ? totalEmployees : 0,
                "activeEmployees", activeEmployees != null ? activeEmployees : 0,
                "pendingLeaves", pendingLeaves != null ? pendingLeaves : 0,
                "totalPayroll", totalPayroll != null ? totalPayroll : 0.0,
                "attendanceToday", attendanceToday != null ? attendanceToday : 0
            );
        }

        /* ===== Authentication & Multi-User Support ===== */
        @PostMapping("/auth/login")
        Map<String, Object> login(@RequestBody Map<String, Object> m) {
            String username = str(m, "username");
            String password = str(m, "password");
            List<Map<String, Object>> users = db.queryForList(
                "SELECT id, username, role, display_name AS displayName, employee_id AS employeeId FROM users WHERE username=? AND password=?",
                username, password
            );
            if (users.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
            }
            Map<String, Object> u = users.get(0);
            return Map.of(
                "status", "ok",
                "token", UUID.randomUUID().toString(),
                "user", u
            );
        }

        @PostMapping("/auth/register")
        @ResponseStatus(HttpStatus.CREATED)
        Map<String, Object> register(@RequestBody Map<String, Object> m) {
            String username = str(m, "username");
            String password = str(m, "password");
            String role = m.getOrDefault("role", "EMPLOYEE").toString().toUpperCase(Locale.ROOT);
            String displayName = m.getOrDefault("displayName", username.contains("@") ? username.split("@")[0] : username).toString();
            String department = m.getOrDefault("department", "Engineering").toString();

            Integer count = db.queryForObject("SELECT COUNT(*) FROM users WHERE username=?", Integer.class, username);
            if (count != null && count > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username / Email already registered");
            }

            Long empId = null;
            List<Map<String, Object>> existingEmp = db.queryForList("SELECT id FROM employees WHERE email=?", username);
            if (!existingEmp.isEmpty()) {
                empId = ((Number) existingEmp.get(0).get("id")).longValue();
            } else {
                db.update(
                    "INSERT INTO employees(name, email, department, job_title, base_salary, leave_balance, status) VALUES(?,?,?,?,?,?,?)",
                    displayName, username, department,
                    role.equals("HR") ? "HR Specialist" : role.equals("MANAGER") ? "Team Lead" : "Associate Engineer",
                    role.equals("HR") ? 50000.0 : role.equals("MANAGER") ? 60000.0 : 42000.0,
                    14, "ACTIVE"
                );
                empId = db.queryForObject("SELECT id FROM employees WHERE email=?", Long.class, username);
            }

            db.update("INSERT INTO users(username, password, role, display_name, employee_id) VALUES(?,?,?,?,?)",
                username, password, role, displayName, empId
            );

            return one("SELECT id, username, role, display_name AS displayName, employee_id AS employeeId FROM users WHERE username=?", username);
        }

        @GetMapping("/auth/users")
        List<Map<String, Object>> listUsers() {
            return db.queryForList("SELECT id, username, role, display_name AS displayName, employee_id AS employeeId, created_at AS createdAt FROM users ORDER BY id ASC");
        }

        /* ===== Employees Management ===== */
        @GetMapping("/employees")
        List<Map<String, Object>> employees() {
            return db.queryForList("SELECT id, name, email, department, job_title AS jobTitle, base_salary AS baseSalary, leave_balance AS leaveBalance, status, created_at AS createdAt FROM employees ORDER BY id DESC");
        }

        @GetMapping("/employees/{id}")
        Map<String, Object> getEmployee(@PathVariable long id) {
            return one("SELECT id, name, email, department, job_title AS jobTitle, base_salary AS baseSalary, leave_balance AS leaveBalance, status, created_at AS createdAt FROM employees WHERE id=?", id);
        }

        @PostMapping("/employees")
        @ResponseStatus(HttpStatus.CREATED)
        Map<String, Object> addEmployee(@RequestBody Map<String, Object> m) {
            String name = str(m, "name");
            String email = str(m, "email").toLowerCase(Locale.ROOT);
            String department = str(m, "department");
            String jobTitle = String.valueOf(m.getOrDefault("jobTitle", "Associate Engineer")).trim();
            double baseSalary = Double.parseDouble(String.valueOf(m.getOrDefault("baseSalary", 35000)));
            int leaveBalance = (int) Math.round(Double.parseDouble(String.valueOf(m.getOrDefault("leaveBalance", 14))));
            String status = String.valueOf(m.getOrDefault("status", "ACTIVE")).trim();

            KeyHolder keyHolder = new GeneratedKeyHolder();
            try {
                db.update(con -> {
                    PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO employees(name, email, department, job_title, base_salary, leave_balance, status) VALUES(?,?,?,?,?,?,?)",
                        Statement.RETURN_GENERATED_KEYS
                    );
                    ps.setString(1, name);
                    ps.setString(2, email);
                    ps.setString(3, department);
                    ps.setString(4, jobTitle);
                    ps.setDouble(5, baseSalary);
                    ps.setInt(6, leaveBalance);
                    ps.setString(7, status);
                    return ps;
                }, keyHolder);
            } catch (org.springframework.dao.DuplicateKeyException e) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An employee with email '" + email + "' already exists.");
            }
            long newId = Objects.requireNonNull(keyHolder.getKey()).longValue();
            return one("SELECT id, name, email, department, job_title AS jobTitle, base_salary AS baseSalary, leave_balance AS leaveBalance, status, created_at AS createdAt FROM employees WHERE id=?", newId);
        }

        @PutMapping("/employees/{id}")
        Map<String, Object> updateEmployee(@PathVariable long id, @RequestBody Map<String, Object> m) {
            one("SELECT id FROM employees WHERE id=?", id);
            String name = str(m, "name");
            String email = str(m, "email").toLowerCase(Locale.ROOT);
            String department = str(m, "department");
            String jobTitle = String.valueOf(m.getOrDefault("jobTitle", "Associate Engineer")).trim();
            double baseSalary = Double.parseDouble(String.valueOf(m.getOrDefault("baseSalary", 0)));
            int leaveBalance = (int) Math.round(Double.parseDouble(String.valueOf(m.getOrDefault("leaveBalance", 0))));
            String status = String.valueOf(m.getOrDefault("status", "ACTIVE")).trim();

            try {
                db.update(
                    "UPDATE employees SET name=?, email=?, department=?, job_title=?, base_salary=?, leave_balance=?, status=? WHERE id=?",
                    name, email, department, jobTitle, baseSalary, leaveBalance, status, id
                );
            } catch (org.springframework.dao.DuplicateKeyException e) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email '" + email + "' is already registered to another employee.");
            }
            return one("SELECT id, name, email, department, job_title AS jobTitle, base_salary AS baseSalary, leave_balance AS leaveBalance, status, created_at AS createdAt FROM employees WHERE id=?", id);
        }

        @DeleteMapping("/employees/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        void deleteEmployee(@PathVariable long id) {
            one("SELECT id FROM employees WHERE id=?", id);
            db.update("DELETE FROM employees WHERE id=?", id);
        }

        /* ===== Leave Management ===== */
        @GetMapping("/leaves")
        List<Map<String, Object>> leaves() {
            return db.queryForList("SELECT l.id, l.employee_id AS employeeId, l.leave_type AS leaveType, l.start_date AS startDate, l.end_date AS endDate, l.days, l.reason, l.status, l.created_at AS createdAt, e.name AS employeeName, e.department FROM leave_requests l JOIN employees e ON e.id=l.employee_id ORDER BY l.id DESC");
        }

        @PostMapping("/leaves")
        @ResponseStatus(HttpStatus.CREATED)
        Map<String, Object> addLeave(@RequestBody Map<String, Object> m) {
            long eid = num(m, "employeeId");
            one("SELECT id FROM employees WHERE id=?", eid);
            String start = str(m, "startDate"), end = str(m, "endDate");
            LocalDate s = LocalDate.parse(start), en = LocalDate.parse(end);
            if (en.isBefore(s)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must be on or after start date");
            int days = (int) ChronoUnit.DAYS.between(s, en) + 1;
            String type = str(m, "leaveType");
            String reason = String.valueOf(m.getOrDefault("reason", ""));

            KeyHolder keyHolder = new GeneratedKeyHolder();
            db.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO leave_requests(employee_id, leave_type, start_date, end_date, days, reason, status) VALUES(?,?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS
                );
                ps.setLong(1, eid);
                ps.setString(2, type);
                ps.setString(3, start);
                ps.setString(4, end);
                ps.setInt(5, days);
                ps.setString(6, reason);
                ps.setString(7, "PENDING");
                return ps;
            }, keyHolder);

            long newId = Objects.requireNonNull(keyHolder.getKey()).longValue();
            return one("SELECT l.id, l.employee_id AS employeeId, l.leave_type AS leaveType, l.start_date AS startDate, l.end_date AS endDate, l.days, l.reason, l.status, l.created_at AS createdAt, e.name AS employeeName, e.department FROM leave_requests l JOIN employees e ON e.id=l.employee_id WHERE l.id=?", newId);
        }

        @RequestMapping(value = "/leaves/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
        Map<String, Object> decideLeave(@PathVariable long id, @RequestBody Map<String, Object> m) {
            String status = str(m, "status").toUpperCase(Locale.ROOT);
            if (!List.of("APPROVED", "REJECTED").contains(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be APPROVED or REJECTED");
            }
            Map<String, Object> l = one("SELECT * FROM leave_requests WHERE id=?", id);
            if (!"PENDING".equals(l.get("status"))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been reviewed");
            }
            long eid = ((Number) l.get("employee_id")).longValue();
            int days = ((Number) l.get("days")).intValue();
            if (status.equals("APPROVED") && !"UNPAID".equals(l.get("leave_type"))) {
                Map<String, Object> e = one("SELECT leave_balance FROM employees WHERE id=?", eid);
                int bal = ((Number) e.get("leave_balance")).intValue();
                if (days > bal) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient leave balance");
                db.update("UPDATE employees SET leave_balance=leave_balance-? WHERE id=?", days, eid);
            }
            db.update("UPDATE leave_requests SET status=? WHERE id=?", status, id);
            return one("SELECT l.id, l.employee_id AS employeeId, l.leave_type AS leaveType, l.start_date AS startDate, l.end_date AS endDate, l.days, l.reason, l.status, l.created_at AS createdAt, e.name AS employeeName, e.department FROM leave_requests l JOIN employees e ON e.id=l.employee_id WHERE l.id=?", id);
        }

        /* ===== Attendance Tracking ===== */
        @GetMapping("/attendance")
        List<Map<String, Object>> attendance() {
            return db.queryForList("SELECT a.id, a.employee_id AS employeeId, e.name AS employeeName, e.department, a.work_date AS workDate, a.status, a.hours FROM attendance a JOIN employees e ON e.id=a.employee_id ORDER BY a.work_date DESC, a.id DESC");
        }

        @PostMapping("/attendance")
        @ResponseStatus(HttpStatus.CREATED)
        Map<String, Object> addAttendance(@RequestBody Map<String, Object> m) {
            long eid = num(m, "employeeId");
            one("SELECT id FROM employees WHERE id=?", eid);
            String date = str(m, "workDate"), status = str(m, "status").toUpperCase(Locale.ROOT);
            if (!List.of("PRESENT", "ABSENT", "LEAVE", "REMOTE").contains(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid attendance status");
            }
            double hours = Double.parseDouble(String.valueOf(m.getOrDefault("hours", 0)));
            db.update("INSERT INTO attendance(employee_id, work_date, status, hours) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), hours=VALUES(hours)", eid, date, status, hours);
            return one("SELECT a.id, a.employee_id AS employeeId, e.name AS employeeName, e.department, a.work_date AS workDate, a.status, a.hours FROM attendance a JOIN employees e ON e.id=a.employee_id WHERE a.employee_id=? AND a.work_date=?", eid, date);
        }

        /* ===== Payroll Register ===== */
        @GetMapping("/payroll")
        List<Map<String, Object>> payroll() {
            return db.queryForList("SELECT p.id, p.employee_id AS employeeId, p.pay_month AS payMonth, p.basic_salary AS basicSalary, p.allowance, p.deduction, p.tax, p.net_salary AS netSalary, p.created_at AS createdAt, e.name AS employeeName, e.department FROM payroll p JOIN employees e ON e.id=p.employee_id ORDER BY p.id DESC");
        }

        @PostMapping("/payroll")
        @ResponseStatus(HttpStatus.CREATED)
        Map<String, Object> addPayroll(@RequestBody Map<String, Object> m) {
            long eid = num(m, "employeeId");
            Map<String, Object> emp = one("SELECT * FROM employees WHERE id=?", eid);
            String month = str(m, "payMonth");
            if (!month.matches("\\d{4}-\\d{2}")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pay month must use YYYY-MM format (e.g. 2026-10)");
            }
            double basic = ((Number) emp.get("base_salary")).doubleValue();
            double allowance = Double.parseDouble(String.valueOf(m.getOrDefault("allowance", 0)));
            double deduction = Double.parseDouble(String.valueOf(m.getOrDefault("deduction", 0)));
            double tax = Double.parseDouble(String.valueOf(m.getOrDefault("tax", 0)));
            if (allowance < 0 || deduction < 0 || tax < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amounts cannot be negative");
            }
            double net = basic + allowance - deduction - tax;
            if (net < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deductions and tax cannot exceed earnings");
            }
            db.update("INSERT INTO payroll(employee_id, pay_month, basic_salary, allowance, deduction, tax, net_salary) VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE basic_salary=VALUES(basic_salary), allowance=VALUES(allowance), deduction=VALUES(deduction), tax=VALUES(tax), net_salary=VALUES(net_salary)", eid, month, basic, allowance, deduction, tax, net);
            return db.queryForMap("SELECT p.id, p.employee_id AS employeeId, p.pay_month AS payMonth, p.basic_salary AS basicSalary, p.allowance, p.deduction, p.tax, p.net_salary AS netSalary, p.created_at AS createdAt, e.name AS employeeName, e.department FROM payroll p JOIN employees e ON e.id=p.employee_id WHERE p.employee_id=? AND p.pay_month=?", eid, month);
        }
    }
}
