-- Dhaga & Co. Intelligence Radar Database Schema

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    hub VARCHAR(50) NOT NULL, -- 'Jaipur', 'Tiruppur', 'Surat'
    category VARCHAR(100) NOT NULL,
    lead_time_days INT NOT NULL,
    active_skus INT DEFAULT 0,
    return_rate NUMERIC(5,2) DEFAULT 0.0,
    rating NUMERIC(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS returns (
    return_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    order_date DATE NOT NULL,
    delivered_date DATE NOT NULL,
    return_date DATE NOT NULL,
    sku VARCHAR(100) NOT NULL,
    vendor_id VARCHAR(50) REFERENCES vendors(vendor_id),
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    size_ordered VARCHAR(10) NOT NULL,
    color_raw VARCHAR(100),
    official_return_reason VARCHAR(100) NOT NULL,
    free_text_other_reason TEXT,
    customer_language VARCHAR(50) DEFAULT 'Hinglish',
    cod BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Initiated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (return_date >= delivered_date AND delivered_date >= order_date)
);

CREATE TABLE IF NOT EXISTS return_intelligence (
    id SERIAL PRIMARY KEY,
    return_id VARCHAR(50) REFERENCES returns(return_id),
    translated_english TEXT,
    normalized_color VARCHAR(100),
    garment_zone VARCHAR(100),
    root_cause VARCHAR(100),
    confidence_score NUMERIC(3,2),
    severity_score INT,
    routing_target VARCHAR(100),
    actionable_recommendation TEXT,
    spec_correction_note TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
