-- SQL Script: Complete Dummy Data for Testing (Pendaftaran & Rekam Medis)
-- Path: /database/dummy_data.sql
-- Instructions: Run this script inside your Supabase SQL Editor to populate the database with comprehensive dummy data.

-- WARNING: This will clear existing data in these tables to prevent key conflict errors during testing.
-- If you want to keep existing data, comment out the DELETE statements below.

BEGIN;

-- 1. Clean up existing data (Safe Cascade)
DELETE FROM pendaftaran_pasien;
DELETE FROM riwayat_kunjungan;
DELETE FROM master_rekam_medis;

-- 2. Seed Master Rekam Medis (Patient Database)
INSERT INTO master_rekam_medis (
  id, no_rm, nik, kk, no_bpjs, panggilan, nama, provinsi_lahir, tempat_lahir, tanggal_lahir, 
  jenis_kelamin, gol_darah, pekerjaan, no_whatsapp, no_hp, provinsi, kabupaten, kecamatan, 
  kelurahan, alamat, puskesmas, nama_suami_isti, nik_suami, no_telp_suami, nama_orang_tua, 
  nik_orang_tua, no_telp_orang_tua, catatan_khusus, created_at, updated_at
) VALUES 
(
  'patient-1', 'RM-202608-001', '3171012345670001', '3171012345679991', '0001234567891', 'Ny.', 'Siti Rahmawati', 
  'DKI Jakarta', 'Jakarta', '1990-05-15', 'P', 'O', 'Ibu Rumah Tangga', '081234567890', '081234567890', 
  'DKI Jakarta', 'Jakarta Selatan', 'Cilandak', 'Gandaria Selatan', 'Jl. Melati No. 12, RT 05/RW 03', 
  'Puskesmas Cilandak', 'Budi Santoso', '3171012345670002', '081298765432', 'Ahmad Ridwan', 
  '3171012345678881', '081122334455', 'Alergi obat Penicillin. Pasien sedang hamil anak kedua.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
),
(
  'patient-2', 'RM-202608-002', '3171012345670002', '3171012345679991', '0001234567892', 'Tn.', 'Budi Santoso', 
  'Jawa Barat', 'Bandung', '1988-11-20', 'L', 'A', 'Karyawan Swasta', '081298765432', '081298765432', 
  'DKI Jakarta', 'Jakarta Selatan', 'Cilandak', 'Gandaria Selatan', 'Jl. Melati No. 12, RT 05/RW 03', 
  'Puskesmas Cilandak', 'Siti Rahmawati', '3171012345670001', '081234567890', 'Hartono', 
  '3171012345678882', '081199887766', 'Riwayat Hipertensi ringan.', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
),
(
  'patient-3', 'RM-202608-003', '3171012345670003', '3171012345679993', '0001234567893', 'Nn.', 'Aisyah Amelia', 
  'Jawa Tengah', 'Semarang', '2000-08-01', 'P', 'B', 'Mahasiswi', '081345678901', '081345678901', 
  'DKI Jakarta', 'Jakarta Barat', 'Kebon Jeruk', 'Kedoya Selatan', 'Jl. Cempaka No. 8, RT 02/RW 04', 
  'Puskesmas Kebon Jeruk', NULL, NULL, NULL, 'Mulyadi', 
  '3171012345678883', '081288776655', 'Alergi Seafood (udang/kepiting).', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
),
(
  'patient-4', 'RM-202608-004', '3171012345670004', '3171012345679994', NULL, 'Ny.', 'Dewi Lestari', 
  'DKI Jakarta', 'Jakarta', '1985-02-10', 'P', 'AB', 'Guru', '081567890123', '081567890123', 
  'DKI Jakarta', 'Jakarta Timur', 'Duren Sawit', 'Pondok Kelapa', 'Jl. Kenanga No. 31, RT 08/RW 01', 
  'Puskesmas Duren Sawit', 'Hendra Wijaya', '3171012345670014', '081599887766', 'Sutrisno', 
  '3171012345678884', '081311223344', 'Pasien memiliki riwayat Asma.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
),
(
  'patient-5', 'RM-202608-005', '3171012345670005', '3171012345679995', '0001234567895', 'Sdr.', 'Rahmat Hidayat', 
  'Jawa Timur', 'Surabaya', '1995-09-12', 'L', 'O', 'Wiraswasta', '081901234567', '081901234567', 
  'Jawa Barat', 'Depok', 'Beji', 'Kemiri Muka', 'Jl. Dahlia No. 19, RT 01/RW 02', 
  'Puskesmas Beji', NULL, NULL, NULL, 'Suryadi', 
  '3171012345678885', '081955443322', NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
),
(
  'patient-6', 'RM-202608-006', '3171012345670006', '3171012345679996', '0001234567896', 'Ny.', 'Tri Handayani', 
  'DKI Jakarta', 'Jakarta', '1992-04-05', 'P', 'A', 'Karyawan Swasta', '081712345678', '081712345678', 
  'Jawa Barat', 'Bekasi', 'Bekasi Barat', 'Bintara', 'Jl. Kamboja No. 14, RT 04/RW 06', 
  'Puskesmas Bekasi Barat', 'Yusuf Habibi', '3171012345670016', '081799887766', 'Sukarto', 
  '3171012345678886', '081711223344', 'Rencana imunisasi rutin balita (anak pertama).', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
),
(
  'patient-7', 'RM-202608-007', '3171012345670007', '3171012345679997', NULL, 'Tn.', 'Supriyanto', 
  'Jawa Tengah', 'Solo', '1979-07-25', 'L', 'B', 'PNS', '081112345678', '081112345678', 
  'Banten', 'Tangerang', 'Serpong', 'Rawa Buntu', 'Jl. Anggrek No. 22, RT 03/RW 05', 
  'Puskesmas Serpong', 'Yanti Kumalasari', '3171012345670017', '081199887755', 'Kartorejo', 
  '3171012345678887', '081155443322', 'Penderita Diabetes Melitus Tipe 2.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
),
(
  'patient-8', 'RM-202608-008', '3171012345670008', '3171012345679998', '0001234567898', 'Ny.', 'Yulianti', 
  'DKI Jakarta', 'Jakarta', '1987-12-03', 'P', 'AB', 'Ibu Rumah Tangga', '081223344556', '081223344556', 
  'DKI Jakarta', 'Jakarta Utara', 'Koja', 'Tugu Utara', 'Jl. Teratai No. 7, RT 10/RW 02', 
  'Puskesmas Koja', 'Wawan Setiawan', '3171012345670018', '081277665544', 'Samsudin', 
  '3171012345678888', '081288990011', 'Pasien KB aktif, memerlukan konsultasi rutin.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
),
(
  'patient-9', 'RM-202608-009', '3171012345670009', '3171012345679999', '0001234567899', 'Sdr.', 'Ahmad Fauzi', 
  'Jawa Barat', 'Bogor', '1998-01-30', 'L', 'O', 'Karyawan Honorer', '081399887766', '081399887766', 
  'Jawa Barat', 'Bogor', 'Bogor Tengah', 'Babakan', 'Jl. Flamboyan No. 56, RT 01/RW 09', 
  'Puskesmas Bogor Tengah', NULL, NULL, NULL, 'Zainal Abidin', 
  '3171012345678889', '081366554433', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
),
(
  'patient-10', 'RM-202608-010', '3171012345670010', '3171012345679900', NULL, 'Nn.', 'Lani Wijaya', 
  'DKI Jakarta', 'Jakarta', '2002-10-14', 'P', 'A', 'Mahasiswi', '081288229911', '081288229911', 
  'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', 'Senayan', 'Jl. Jasmine No. 3, RT 01/RW 01', 
  'Puskesmas Kebayoran Baru', NULL, NULL, NULL, 'Wijaya', 
  '3171012345678800', '081211229988', 'Riwayat hipotensi.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
);

-- 3. Seed Riwayat Kunjungan (Visit Records)
INSERT INTO riwayat_kunjungan (
  id, patient_id, tanggal_kunjungan, keluhan, diagnosa, layanan, petugas, created_at
) VALUES 
(
  'visit-1', 'patient-1', '2026-08-01', 'Pemeriksaan kehamilan rutin trimester 2, pusing ringan.', 'Kehamilan Normal Trimester 2', 'AnteNatal Care (ANC)', 'Bidan Sri Wahyuni, S.Tr.Keb', NOW() - INTERVAL '9 days'
),
(
  'visit-2', 'patient-2', '2026-08-02', 'Kontrol tekanan darah, kepala terasa tegang di bagian belakang.', 'Hipertensi Esensial Primer', 'Poli Umum', 'dr. Andi Wijaya', NOW() - INTERVAL '8 days'
),
(
  'visit-3', 'patient-3', '2026-08-03', 'Gatal-gatal di seluruh tubuh setelah makan seafood.', 'Urtikaria Akut (Alergi)', 'Poli Umum', 'dr. Andi Wijaya', NOW() - INTERVAL '7 days'
),
(
  'visit-4', 'patient-4', '2026-08-04', 'Sesak napas kambuh setelah terpapar debu tebal.', 'Asma Bronkial Eksaserbasi Ringan', 'Poli Umum', 'dr. Rian Pratama', NOW() - INTERVAL '6 days'
),
(
  'visit-5', 'patient-5', '2026-08-05', 'Demam naik turun selama 3 hari disertai nyeri sendi.', 'Observasi Febris e.c Suspect Demam Dengue', 'Poli Umum', 'dr. Rian Pratama', NOW() - INTERVAL '5 days'
),
(
  'visit-6', 'patient-6', '2026-08-06', 'Konsultasi tumbuh kembang balita dan rencana imunisasi DPT.', 'Balita Sehat', 'Imunisasi', 'Bidan Endang Lestari', NOW() - INTERVAL '4 days'
),
(
  'visit-7', 'patient-7', '2026-08-07', 'Kontrol gula darah rutin, lemas di pagi hari.', 'Diabetes Melitus Tipe 2 Terkontrol', 'Poli Umum', 'dr. Andi Wijaya', NOW() - INTERVAL '3 days'
),
(
  'visit-8', 'patient-8', '2026-08-08', 'Suntik KB rutin 3 bulanan.', 'Akseptor KB Suntik 3 Bulan', 'Pelayanan KB', 'Bidan Sri Wahyuni, S.Tr.Keb', NOW() - INTERVAL '2 days'
),
(
  'visit-9', 'patient-1', '2026-08-09', 'Pemeriksaan lanjutan ANC, keluhan pusing sudah berkurang.', 'Kehamilan Normal Trimester 2, G1P0A0', 'AnteNatal Care (ANC)', 'Bidan Sri Wahyuni, S.Tr.Keb', NOW() - INTERVAL '1 day'
);

-- 4. Seed Pendaftaran Pasien (Queue, Bookings, Active Registrations)
-- Includes various states: 'Menunggu', 'Menunggu Check-In', 'Diperiksa', 'Selesai', 'Batal'
INSERT INTO pendaftaran_pasien (
  id, no_antrean, jenis_layanan, patient_id, no_rm, nik, panggilan, nama, jenis_kelamin, 
  tanggal_lahir, usia, alamat, no_whatsapp, puskesmas, penanggung_jawab, penjamin, 
  sumber_pendaftaran, status, tanggal_booking, jam_booking, waktu_registrasi, created_at, updated_at
) VALUES 
-- Active Waiting Queue (Menunggu)
(
  'reg-1', 'A-001', 'AnteNatal Care (ANC) - Trimester 2', 'patient-1', 'RM-202608-001', '3171012345670001', 'Ny.', 'Siti Rahmawati', 'P', 
  '1990-05-15', '36 Tahun 2 Bulan', 'Jl. Melati No. 12, RT 05/RW 03', '081234567890', 'Puskesmas Cilandak', 'Pribadi / Umum', 'Umum', 
  'Offline', 'Menunggu', NULL, NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
),
(
  'reg-2', 'B-001', 'Poli Umum - Pemeriksaan Fisik', 'patient-3', 'RM-202608-003', '3171012345670003', 'Nn.', 'Aisyah Amelia', 'P', 
  '2000-08-01', '26 Tahun 0 Bulan', 'Jl. Cempaka No. 8, RT 02/RW 04', '081345678901', 'Puskesmas Kebon Jeruk', 'Suami/Keluarga', 'Umum', 
  'Offline', 'Menunggu', NULL, NULL, NOW() - INTERVAL '1.5 hours', NOW() - INTERVAL '1.5 hours', NOW() - INTERVAL '1.5 hours'
),
(
  'reg-3', 'C-001', 'Imunisasi - DPT Campak', 'patient-6', 'RM-202608-006', '3171012345670006', 'Ny.', 'Tri Handayani', 'P', 
  '1992-04-05', '34 Tahun 4 Bulan', 'Jl. Kamboja No. 14, RT 04/RW 06', '081712345678', 'Puskesmas Bekasi Barat', 'Suami/Keluarga', 'BPJS Kesehatan', 
  'Offline', 'Menunggu', NULL, NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
),

-- Currently Examined (Diperiksa)
(
  'reg-4', 'A-002', 'Poli Umum - Kontrol Diabetes', 'patient-7', 'RM-202608-007', '3171012345670007', 'Tn.', 'Supriyanto', 'L', 
  '1979-07-25', '47 Tahun 0 Bulan', 'Jl. Anggrek No. 22, RT 03/RW 05', '081112345678', 'Puskesmas Serpong', 'Pribadi / Umum', 'BPJS Kesehatan', 
  'Offline', 'Diperiksa', NULL, NULL, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'
),

-- Online Booking Awaiting Check-In (Menunggu Check-In)
(
  'reg-5', 'BK-1001', 'Poli Umum - Konsultasi Asma', 'patient-4', 'RM-202608-004', '3171012345670004', 'Ny.', 'Dewi Lestari', 'P', 
  '1985-02-10', '41 Tahun 6 Bulan', 'Jl. Kenanga No. 31, RT 08/RW 01', '081567890123', 'Puskesmas Duren Sawit', 'Pribadi / Umum', 'Umum', 
  'Online', 'Menunggu Check-In', CURRENT_DATE, '09:00 - 10:00', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'
),
(
  'reg-6', 'BK-1002', 'Pelayanan KB - Konsultasi Pil KB', 'patient-8', 'RM-202608-008', '3171012345670008', 'Ny.', 'Yulianti', 'P', 
  '1987-12-03', '38 Tahun 8 Bulan', 'Jl. Teratai No. 7, RT 10/RW 02', '081223344556', 'Puskesmas Koja', 'Pribadi / Umum', 'BPJS Kesehatan', 
  'Online', 'Menunggu Check-In', CURRENT_DATE, '10:30 - 11:30', NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '2.5 hours'
),

-- Completed Visits (Selesai)
(
  'reg-7', 'A-003', 'Poli Umum - Pemeriksaan Fisik', 'patient-2', 'RM-202608-002', '3171012345670002', 'Tn.', 'Budi Santoso', 'L', 
  '1988-11-20', '37 Tahun 8 Bulan', 'Jl. Melati No. 12, RT 05/RW 03', '081298765432', 'Puskesmas Cilandak', 'Pribadi / Umum', 'Umum', 
  'Offline', 'Selesai', NULL, NULL, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '10 minutes'
),
(
  'reg-8', 'B-002', 'Poli Umum - Konsultasi Flu', 'patient-5', 'RM-202608-005', '3171012345670005', 'Sdr.', 'Rahmat Hidayat', 'L', 
  '1995-09-12', '30 Tahun 11 Bulan', 'Jl. Dahlia No. 19, RT 01/RW 02', '081901234567', 'Puskesmas Beji', 'Pribadi / Umum', 'Umum', 
  'Offline', 'Selesai', NULL, NULL, NOW() - INTERVAL '3.5 hours', NOW() - INTERVAL '3.5 hours', NOW() - INTERVAL '20 minutes'
),

-- Cancelled Registration (Batal)
(
  'reg-9', 'C-002', 'Poli Umum - Nyeri Lambung', 'patient-9', 'RM-202608-009', '3171012345670009', 'Sdr.', 'Ahmad Fauzi', 'L', 
  '1998-01-30', '28 Tahun 6 Bulan', 'Jl. Flamboyan No. 56, RT 01/RW 09', '081399887766', 'Puskesmas Bogor Tengah', 'Pribadi / Umum', 'Umum', 
  'Offline', 'Batal', NULL, NULL, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours'
);

COMMIT;
