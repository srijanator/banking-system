-- Create database
CREATE DATABASE banking_system;
USE banking_system;

-- Users table for authentication
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches table
CREATE TABLE branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    branch_code VARCHAR(10) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    branch_id INT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type ENUM('savings', 'current') NOT NULL,
    interest DECIMAL(3,2) DEFAULT 0.00,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT,
    to_account_id INT,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'interest') NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(account_id)
);

-- Beneficiaries table for quick transfers
CREATE TABLE beneficiaries (
    beneficiary_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    beneficiary_account_number VARCHAR(20) NOT NULL,
    beneficiary_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

-- Insert sample data
INSERT INTO branches (branch_name, branch_code, address, phone) VALUES
('Main Branch', 'MB001', '123 Main Street, City Center', '555-0101'),
('Downtown Branch', 'DT002', '456 Downtown Ave, Business District', '555-0102'),
('Suburban Branch', 'SB003', '789 Suburban Blvd, Residential Area', '555-0103');

-- Insert sample users (passwords are 'password123' hashed)
INSERT INTO users (username, password_hash, email, full_name, phone) VALUES
('john_doe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'john@example.com', 'John Doe', '555-1001'),
('jane_smith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'jane@example.com', 'Jane Smith', '555-1002'),
('bob_wilson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'bob@example.com', 'Bob Wilson', '555-1003');

-- Insert sample accounts
INSERT INTO accounts (user_id, branch_id, account_number, account_type, balance) VALUES
(1, 1, '123456789012', 'savings', 5000.00),
(1, 1, '123456789013', 'current', 2500.00),
(2, 2, '123456789014', 'savings', 7500.00),
(3, 3, '123456789015', 'current', 1200.00);

-- Insert sample transactions
INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description) VALUES
(NULL, 1, 1000.00, 'deposit', 'Initial deposit'),
(NULL, 2, 500.00, 'deposit', 'Initial deposit'),
(1, 2, 200.00, 'transfer', 'Transfer to current account'),
(NULL, 3, 2000.00, 'deposit', 'Initial deposit');