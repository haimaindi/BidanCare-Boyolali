CREATE TABLE IF NOT EXISTS tagihan_pasien (
    id VARCHAR(50) PRIMARY KEY,
    visit_id VARCHAR(50) NOT NULL UNIQUE,
    patient_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    base_service_fee NUMERIC(10,2) DEFAULT 0,
    medicine_price NUMERIC(10,2) DEFAULT 0,
    bhp_price NUMERIC(10,2) DEFAULT 0,
    other_service_price NUMERIC(10,2) DEFAULT 0,
    total_bill NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Belum Lunas',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piutang_pasien (
    visit_id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    total_bill NUMERIC(10,2) DEFAULT 0,
    payment_history JSONB NOT NULL DEFAULT '[]',
    next_due_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'Belum Lunas',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
