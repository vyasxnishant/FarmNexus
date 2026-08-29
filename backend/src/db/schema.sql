-- FarmNexus PostgreSQL Schema

CREATE TABLE IF NOT EXISTS markets (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  distance_km_default INTEGER DEFAULT 25,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commodities (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) DEFAULT '₹/qtl',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_prices (
  id VARCHAR(64) PRIMARY KEY,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  market VARCHAR(255) NOT NULL,
  commodity VARCHAR(255) NOT NULL,
  variety VARCHAR(255) DEFAULT 'Standard',
  grade VARCHAR(100) DEFAULT 'Grade A',
  arrival_date VARCHAR(50) NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  arrival_quantity NUMERIC(12, 2) DEFAULT 0,
  source VARCHAR(255) NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_arrivals (
  id VARCHAR(64) PRIMARY KEY,
  market VARCHAR(255) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  commodity VARCHAR(255) NOT NULL,
  arrival_date VARCHAR(50) NOT NULL,
  quantity_tons NUMERIC(12, 2) NOT NULL,
  source VARCHAR(255) NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid filtering
CREATE INDEX IF NOT EXISTS idx_prices_commodity ON market_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_prices_market ON market_prices(market);
CREATE INDEX IF NOT EXISTS idx_prices_district ON market_prices(district);
CREATE INDEX IF NOT EXISTS idx_prices_state ON market_prices(state);
CREATE INDEX IF NOT EXISTS idx_prices_arrival_date ON market_prices(arrival_date);

