-- SQL to delete all data from master_rekam_medis
-- Use this if you want to clear the table before re-importing data

DELETE FROM master_rekam_medis;

-- If you also want to clear pendaftaran (registration) history related to these patients:
-- DELETE FROM pendaftaran_pasien;

-- If you want to reset the table completely (including constraints if needed, but here we just clear data):
-- TRUNCATE TABLE master_rekam_medis CASCADE;
