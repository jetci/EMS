-- Export ข้อมูลจาก Database: wiangwec_wecare
-- คำสั่ง Export ทั้งหมด

-- Export Users
SELECT * FROM users INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export Driver Profiles
SELECT * FROM driver_profiles INTO OUTFILE '/tmp/driver_profiles.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export Patients
SELECT * FROM patients INTO OUTFILE '/tmp/patients.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export Vehicles
SELECT * FROM vehicles INTO OUTFILE '/tmp/vehicles.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export Rides
SELECT * FROM rides INTO OUTFILE '/tmp/rides.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export News Articles
SELECT * FROM news_articles INTO OUTFILE '/tmp/news_articles.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export Audit Logs
SELECT * FROM audit_logs INTO OUTFILE '/tmp/audit_logs.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- หรือใช้คำสั่ง mysqldump
-- mysqldump -u wiangwec_wecare -p wiangwec_wecare > backup.sql
