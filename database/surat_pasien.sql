CREATE TABLE IF NOT EXISTS surat_sakit (
    id VARCHAR(50) PRIMARY KEY,
    pemeriksaan_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255),
    patient_age VARCHAR(50),
    patient_job VARCHAR(255),
    patient_address TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER,
    doctor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surat_keterangan_lahir (
    id VARCHAR(50) PRIMARY KEY,
    pemeriksaan_id VARCHAR(50) NOT NULL,
    mother_name VARCHAR(255),
    mother_age VARCHAR(50),
    mother_job VARCHAR(255),
    mother_address TEXT,
    father_name VARCHAR(255),
    father_age VARCHAR(50),
    father_job VARCHAR(255),
    baby_name VARCHAR(255),
    baby_gender VARCHAR(10),
    baby_weight NUMERIC(5,2),
    baby_length NUMERIC(5,2),
    birth_date DATE,
    birth_time TIME,
    birth_type VARCHAR(100),
    doctor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surat_pengantar_lab (
    id VARCHAR(50) PRIMARY KEY,
    pemeriksaan_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255),
    patient_age VARCHAR(50),
    patient_gender VARCHAR(10),
    patient_address TEXT,
    clinical_diagnosis TEXT,
    lab_tests JSONB,
    doctor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
