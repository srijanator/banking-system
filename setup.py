#!/usr/bin/env python3
"""
Setup script for Banking System
This script helps initialize the database and create sample data.
"""

import mysql.connector
from mysql.connector import Error
import os

def setup_database():
    """Initialize the database and create tables"""
    
    # Database configuration
    config = {
        'host': 'localhost',
        'user': 'root',
        'password': '123',  # Change this to your MySQL password
    }
    
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        print("Connected to MySQL server successfully!")
        
        # Read and execute SQL file
        with open('tables.sql', 'r') as file:
            sql_script = file.read()
        
        # Split the script into individual statements
        statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
        
        for statement in statements:
            if statement:
                cursor.execute(statement)
                print(f"Executed: {statement[:50]}...")
        
        connection.commit()
        print("Database setup completed successfully!")
        
    except Error as e:
        print(f"Error setting up database: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed.")
    
    return True

def create_sample_user():
    """Create a sample user for testing"""
    from werkzeug.security import generate_password_hash
    
    config = {
        'host': 'localhost',
        'user': 'root',
        'password': 'password',
        'database': 'banking_system'
    }
    
    try:
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Check if sample user already exists
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        if cursor.fetchone()[0] > 0:
            print("Sample user 'admin' already exists!")
            return True
        
        # Create sample user
        password_hash = generate_password_hash('admin123')
        cursor.execute("""
            INSERT INTO users (username, password_hash, email, full_name, phone)
            VALUES (%s, %s, %s, %s, %s)
        """, ('admin', password_hash, 'admin@bank.com', 'Administrator', '555-0000'))
        
        user_id = cursor.lastrowid
        
        # Create sample account for admin
        cursor.execute("""
            INSERT INTO accounts (user_id, branch_id, account_number, account_type, balance)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, 1, '123456789000', 'savings', 10000.00))
        
        connection.commit()
        print("Sample user 'admin' created with password 'admin123'")
        print("Sample account created with $10,000 balance")
        
    except Error as e:
        print(f"Error creating sample user: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
    
    return True

if __name__ == "__main__":
    print("Banking System Setup")
    print("===================")
    
    print("\n1. Setting up database...")
    if setup_database():
        print("\n2. Creating sample user...")
        create_sample_user()
        
        print("\n" + "="*50)
        print("Setup completed successfully!")
        print("="*50)
        print("\nTo run the application:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Update database password in model.py if needed")
        print("3. Run the application: python app.py")
        print("\nSample login credentials:")
        print("Username: admin")
        print("Password: admin123")
        print("\nOr register a new account through the web interface.")
    else:
        print("Setup failed. Please check your MySQL configuration.")
