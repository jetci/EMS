-- Export ข้อมูลทั้งหมดจาก Database: wiangwec_wecare
-- ใช้คำสั่งนี้ใน Command Line หรือ Terminal

-- วิธีที่ 1: Export ทั้ง Database (Schema + Data)
-- mysqldump -u wiangwec_wecare -p wiangwec_wecare > wiangwec_full_backup.sql

-- วิธีที่ 2: Export เฉพาะข้อมูล (ไม่รวม Schema)
-- mysqldump -u wiangwec_wecare -p --no-create-info wiangwec_wecare > wiangwec_data_only.sql

-- วิธีที่ 3: Export แต่ละ Table เป็น CSV (ต้องมีสิทธิ์ FILE)
-- หมายเหตุ: เปลี่ยน path ให้ตรงกับระบบของคุณ

-- Export audit_logs
SELECT * FROM audit_logs 
INTO OUTFILE 'C:/tmp/audit_logs.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export drivers (ถ้ามี)
SELECT * FROM drivers 
INTO OUTFILE 'C:/tmp/drivers.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export news_articles
SELECT * FROM news_articles 
INTO OUTFILE 'C:/tmp/news_articles.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export patients
SELECT * FROM patients 
INTO OUTFILE 'C:/tmp/patients.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export rides
SELECT * FROM rides 
INTO OUTFILE 'C:/tmp/rides.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export system_settings
SELECT * FROM system_settings 
INTO OUTFILE 'C:/tmp/system_settings.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export teams
SELECT * FROM teams 
INTO OUTFILE 'C:/tmp/teams.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export users
SELECT * FROM users 
INTO OUTFILE 'C:/tmp/users.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- Export vehicles
SELECT * FROM vehicles 
INTO OUTFILE 'C:/tmp/vehicles.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n';

-- หมายเหตุ:
-- 1. ถ้า Error "The MySQL server is running with the --secure-file-priv option"
--    ให้ใช้ mysqldump แทน
-- 2. สำหรับ Windows ใช้ path แบบ: 'C:/tmp/filename.csv'
-- 3. สำหรับ Linux/Mac ใช้ path แบบ: '/tmp/filename.csv'
