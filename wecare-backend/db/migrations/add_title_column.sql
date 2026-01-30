-- Add title column to patients table

ALTER TABLE patients ADD COLUMN title TEXT;

-- Update existing patients with default title based on gender
UPDATE patients 
SET title = CASE 
    WHEN gender = 'ชาย' OR gender = 'Male' OR gender = 'male' THEN 'นาย'
    WHEN gender = 'หญิง' OR gender = 'Female' OR gender = 'female' THEN 'นางสาว'
    ELSE NULL
END
WHERE title IS NULL;
