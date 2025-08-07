-- Create test database
CREATE DATABASE IF NOT EXISTS wimm_test;

-- Use the test database
USE wimm_test;

-- The user data
-- Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
    id CHAR(36) NOT NULL DEFAULT (UUID()),  -- Using UUID() function in MySQL
    user_name VARCHAR(50) NOT NULL UNIQUE,  -- Changed to VARCHAR with UNIQUE constraint
    password_hash CHAR(60) NOT NULL,
    PRIMARY KEY (id)
);

-- The cashflow data
-- Create the cashflow_data table
CREATE TABLE IF NOT EXISTS cashflow_data (
    id CHAR(36) NOT NULL DEFAULT (UUID()),  -- Using UUID() function in MySQL
    user_id CHAR(36) NOT NULL,  -- Matching UUID format for the foreign key
    value DECIMAL(12, 2) NOT NULL,
    description TEXT,
    time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_cashflow_user_time ON cashflow_data(user_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_user_username ON user_data(user_name);
CREATE INDEX IF NOT EXISTS idx_cashflow_user_id ON cashflow_data(user_id);

-- Create a test user (password: 'password')
INSERT IGNORE INTO user_data (user_name, password_hash) VALUES ('user1', '$2b$12$ZnOatuXNV4PlSGI63TXAS.VlAIBEc3CRnqb.GmSNBXdVkDzCJi9jW');