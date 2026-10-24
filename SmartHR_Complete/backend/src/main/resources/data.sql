INSERT IGNORE INTO employees(id,name,email,department,job_title,base_salary,leave_balance,status) VALUES
(1,'Aarav Sharma','employee@demo.com','Engineering','Software Engineer',45000,12,'ACTIVE'),
(2,'Priya Patel','priya@demo.com','Human Resources','HR Executive',38000,10,'ACTIVE'),
(3,'Rohan Mehta','rohan@demo.com','Engineering','Backend Developer',52000,8,'ACTIVE'),
(4,'Ananya Desai','ananya@demo.com','Marketing','Marketing Associate',35000,14,'ACTIVE');
INSERT IGNORE INTO leave_requests(id,employee_id,leave_type,start_date,end_date,days,reason,status) VALUES
(1,1,'ANNUAL','2026-10-26','2026-10-27',2,'Personal work','PENDING'),
(2,3,'SICK','2026-10-20','2026-10-20',1,'Not feeling well','APPROVED'),
(3,4,'ANNUAL','2026-10-29','2026-10-30',2,'Family event','PENDING');
INSERT IGNORE INTO attendance(id,employee_id,work_date,status,hours) VALUES
(1,1,'2026-10-20','PRESENT',8),(2,2,'2026-10-20','PRESENT',8),(3,3,'2026-10-20','REMOTE',8),(4,4,'2026-10-20','ABSENT',0);
INSERT IGNORE INTO payroll(id,employee_id,pay_month,basic_salary,allowance,deduction,tax,net_salary) VALUES
(1,1,'2026-09',45000,3000,500,2500,45000),(2,2,'2026-09',38000,2000,0,1800,38200),(3,3,'2026-09',52000,4000,1000,3500,51500);

INSERT IGNORE INTO users (id, username, password, role, display_name, employee_id) VALUES
(1, 'admin@peoplepilot.com', 'admin123', 'HR', 'HR Administrator', 2),
(2, 'manager@peoplepilot.com', 'manager123', 'MANAGER', 'Rohan Mehta (Manager)', 3),
(3, 'employee@demo.com', 'employee123', 'EMPLOYEE', 'Aarav Sharma', 1),
(4, 'priya@demo.com', 'priya123', 'EMPLOYEE', 'Priya Patel', 2);
