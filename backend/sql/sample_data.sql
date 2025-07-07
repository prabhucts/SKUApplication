-- Sample Data for SKU Management Application
-- This file contains DML statements to populate the database with sample data

-- Disable foreign key constraints during import
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Sample data for drug_skus table
INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(1, '12345-678-90', 'Aspirin 81mg Tablets', 'Generic Pharma', 'Tablet', '81mg', '100 tablets', NULL, NULL, 'APPROVED', '2025-06-10 08:58:33', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(2, '98765-432-10', 'Ibuprofen 200mg Capsules', 'MedCorp', 'Capsule', '200mg', '50 capsules', NULL, NULL, 'PENDING_REVIEW', '2025-06-10 08:58:33', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(3, '11111-222-33', 'Acetaminophen 500mg Tablets', 'HealthPlus', 'Tablet', '500mg', '200 tablets', NULL, NULL, 'APPROVED', '2025-06-10 08:58:33', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(4, '55555-666-77', 'Test Drug 500mg', 'Test Pharma', 'Tablet', '500mg', '30 tablets', NULL, NULL, 'DRAFT', '2025-06-10 09:05:43', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(5, 'TEST-123-45', 'Test OCR Drug', 'Test Pharmaceutical', 'Tablet', '100mg', '30 tablets', NULL, NULL, 'DRAFT', '2025-06-10 15:32:55', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(6, 'TEST-UNIQUE-001', 'Updated Test Drug', 'Test Pharma Co', 'Tablet', '500mg', '60 tablets', NULL, NULL, 'DRAFT', '2025-06-13 06:51:38', '2025-06-13 06:52:57', NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(7, '12345-1234-55', 'Aspirin 100 mg tablets', 'Ranbaxy', 'Tablet', '100mg', '30', NULL, NULL, 'DRAFT', '2025-06-13 08:42:58', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(8, '12344-456-00', 'aspirin 81mg by bayer', 'Bayer', 'Tablet', '81mg', '20', NULL, NULL, 'APPROVED', '2025-06-15 16:38:35', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(12, '11111-2222-33', 'Test Drug Via Script', 'Test Labs', 'Tablet', '10mg', '30 tablets', NULL, NULL, 'APPROVED', '2025-06-15 17:00:54', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(14, '12344-345-99', 'ibprofen', 'Ranbaxy', 'Tablet', '100mg', '50', NULL, NULL, 'APPROVED', '2025-06-16 16:44:49', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(15, '12345-678-91', 'Aspirin 81mg Tablets', 'Generic Pharma', 'Tablet', '81mg', '100 tablets', NULL, NULL, 'APPROVED', '2025-06-23 15:48:38', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(16, '12345-678-99', 'Test Drug', 'Test Labs', 'tablet', '10mg', '100', NULL, NULL, 'DRAFT', '2025-06-23 16:04:04', NULL, NULL, NULL);

INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(17, '12345-678-92', 'Test Drug', 'Test Labs', 'tablet', '10mg', '100', NULL, NULL, 'DRAFT', '2025-06-23 16:07:00', NULL, NULL, NULL);

-- Add new SKU for Gelusis 83 mg by Ranstad
INSERT INTO drug_skus (id, ndc, name, manufacturer, dosage_form, strength, package_size, gtin, image_url, status, created_at, last_modified, created_by, reviewed_by) 
VALUES(18, 'GELUSIS-83-01', 'Gelusis 83 mg', 'Ranstad', 'Tablet', '83mg', '60 tablets', NULL, NULL, 'APPROVED', '2025-06-29 10:00:00', NULL, NULL, NULL);

-- Enable foreign key constraints after import
COMMIT;
PRAGMA foreign_keys=ON;
