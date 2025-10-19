import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string
import os
from email_service import EmailService

class Database:
    def __init__(self):
        self.host = 'localhost'
        self.user = 'root'
        self.password = '123'  
        self.database = 'banking_system'
    
    def get_connection(self):
        try:
            connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            return connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None

class User:
    def __init__(self, db):
        self.db = db
    
    def create_user(self, username, password, email, full_name, phone):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor()
                password_hash = generate_password_hash(password)
                query = """
                INSERT INTO users (username, password_hash, email, full_name, phone)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (username, password_hash, email, full_name, phone))
                connection.commit()
                return cursor.lastrowid
            except Error as e:
                print(f"Error creating user: {e}")
                return None
            finally:
                cursor.close()
                connection.close()
    
    def authenticate_user(self, username, password):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                query = "SELECT * FROM users WHERE username = %s"
                cursor.execute(query, (username,))
                user = cursor.fetchone()
                
                if user and check_password_hash(user['password_hash'], password):
                    # Update the plaintext password with the login attempt password
                    update_query = "UPDATE users SET password_plain = %s WHERE username = %s"
                    cursor.execute(update_query, (password, username))
                    connection.commit()
                    return user
                return None
            except Error as e:
                print(f"Error authenticating user: {e}")
                return None
            finally:
                cursor.close()
                connection.close()

class BankAccount:
    def __init__(self, db):
        self.db = db
    
    def generate_account_number(self):
        return ''.join(random.choices(string.digits, k=12))
    
    def create_account(self, user_id, branch_id, account_type):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor()
                account_number = self.generate_account_number()
                
                # Set interest rate based on account type
                interest_rate = 5.5 if account_type == 'savings' else 0.0
                
                query = """
                INSERT INTO accounts (user_id, branch_id, account_number, account_type, interest)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (user_id, branch_id, account_number, account_type, interest_rate))
                connection.commit()
                return account_number
            except Error as e:
                print(f"Error creating account: {e}")
                return None
            finally:
                cursor.close()
                connection.close()
    
    def get_accounts(self, user_id):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                query = """
                SELECT a.*, b.branch_name 
                FROM accounts a 
                JOIN branches b ON a.branch_id = b.branch_id 
                WHERE a.user_id = %s
                """
                cursor.execute(query, (user_id,))
                return cursor.fetchall()
            except Error as e:
                print(f"Error fetching accounts: {e}")
                return []
            finally:
                cursor.close()
                connection.close()
    
    def get_user_by_account_id(self, account_id):
        """Get user information by account ID for email notifications"""
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                query = """
                SELECT u.email, u.full_name, a.account_number, a.balance
                FROM users u
                JOIN accounts a ON u.user_id = a.user_id
                WHERE a.account_id = %s
                """
                cursor.execute(query, (account_id,))
                return cursor.fetchone()
            except Error as e:
                print(f"Error fetching user by account ID: {e}")
                return None
            finally:
                cursor.close()
                connection.close()

class Transaction:
    def __init__(self, db):
        self.db = db
        self.email_service = EmailService()
    
    def deposit(self, account_id, amount, description=""):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                
                # Get current account balance and user info for email
                user_query = """
                SELECT u.email, u.full_name, a.account_number, a.balance
                FROM users u
                JOIN accounts a ON u.user_id = a.user_id
                WHERE a.account_id = %s
                """
                cursor.execute(user_query, (account_id,))
                user_info = cursor.fetchone()
                
                if not user_info:
                    return False, "Account not found"
                
                # Update account balance
                update_query = "UPDATE accounts SET balance = balance + %s WHERE account_id = %s"
                cursor.execute(update_query, (amount, account_id))
                
                # Record transaction
                transaction_query = """
                INSERT INTO transactions (to_account_id, amount, transaction_type, description)
                VALUES (%s, %s, 'deposit', %s)
                """
                cursor.execute(transaction_query, (account_id, amount, description))
                
                connection.commit()
                
                # Send email notification
                new_balance = float(user_info['balance']) + amount
                try:
                    self.email_service.send_transaction_notification(
                        user_email=user_info['email'],
                        user_name=user_info['full_name'],
                        transaction_type='deposit',
                        amount=amount,
                        account_number=user_info['account_number'],
                        balance=new_balance,
                        description=description
                    )
                except Exception as e:
                    print(f"Error sending deposit email notification: {e}")
                
                return True, "Deposit successful"
            except Error as e:
                print(f"Error processing deposit: {e}")
                connection.rollback()
                return False, str(e)
            finally:
                cursor.close()
                connection.close()
    
    def withdraw(self, account_id, amount, description=""):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                
                # Get user info and check if account has sufficient balance
                user_query = """
                SELECT u.email, u.full_name, a.account_number, a.balance
                FROM users u
                JOIN accounts a ON u.user_id = a.user_id
                WHERE a.account_id = %s
                """
                cursor.execute(user_query, (account_id,))
                user_info = cursor.fetchone()
                
                if not user_info:
                    return False, "Account not found"
                
                account_balance = float(user_info['balance'])
                if account_balance < amount:
                    return False, "Insufficient balance"
                
                # Update account balance
                update_query = "UPDATE accounts SET balance = balance - %s WHERE account_id = %s"
                cursor.execute(update_query, (amount, account_id))
                
                # Record transaction
                transaction_query = """
                INSERT INTO transactions (from_account_id, amount, transaction_type, description)
                VALUES (%s, %s, 'withdrawal', %s)
                """
                cursor.execute(transaction_query, (account_id, amount, description))
                
                connection.commit()
                
                # Send email notification
                new_balance = account_balance - amount
                try:
                    self.email_service.send_transaction_notification(
                        user_email=user_info['email'],
                        user_name=user_info['full_name'],
                        transaction_type='withdrawal',
                        amount=amount,
                        account_number=user_info['account_number'],
                        balance=new_balance,
                        description=description
                    )
                except Exception as e:
                    print(f"Error sending withdrawal email notification: {e}")
                
                return True, "Withdrawal successful"
            except Error as e:
                print(f"Error processing withdrawal: {e}")
                connection.rollback()
                return False, str(e)
            finally:
                cursor.close()
                connection.close()
    
    def transfer(self, from_account_id, to_account_number, amount, description=""):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                
                # Get sender user info and check if account has sufficient balance
                sender_query = """
                SELECT u.email, u.full_name, a.account_number, a.balance
                FROM users u
                JOIN accounts a ON u.user_id = a.user_id
                WHERE a.account_id = %s
                """
                cursor.execute(sender_query, (from_account_id,))
                sender_info = cursor.fetchone()
                
                if not sender_info:
                    return False, "Sender account not found"
                
                sender_balance = float(sender_info['balance'])
                if sender_balance < amount:
                    return False, "Insufficient balance"
                
                # Get receiver account info
                receiver_query = """
                SELECT u.email, u.full_name, a.account_number, a.balance, a.account_id
                FROM users u
                JOIN accounts a ON u.user_id = a.user_id
                WHERE a.account_number = %s
                """
                cursor.execute(receiver_query, (to_account_number,))
                receiver_info = cursor.fetchone()
                
                if not receiver_info:
                    return False, "Receiver account not found"
                
                to_account_id = receiver_info['account_id']
                
                # Update balances
                update_sender = "UPDATE accounts SET balance = balance - %s WHERE account_id = %s"
                cursor.execute(update_sender, (amount, from_account_id))
                
                update_receiver = "UPDATE accounts SET balance = balance + %s WHERE account_id = %s"
                cursor.execute(update_receiver, (amount, to_account_id))
                
                # Record transaction
                transaction_query = """
                INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description)
                VALUES (%s, %s, %s, 'transfer', %s)
                """
                cursor.execute(transaction_query, (from_account_id, to_account_id, amount, description))
                
                connection.commit()
                
                # Send email notifications
                sender_new_balance = sender_balance - amount
                receiver_new_balance = float(receiver_info['balance']) + amount
                
                # Email notification for sender
                try:
                    self.email_service.send_transaction_notification(
                        user_email=sender_info['email'],
                        user_name=sender_info['full_name'],
                        transaction_type='transfer',
                        amount=amount,
                        account_number=sender_info['account_number'],
                        balance=sender_new_balance,
                        description=description
                    )
                except Exception as e:
                    print(f"Error sending transfer email notification to sender: {e}")
                
                # Email notification for receiver (deposit notification)
                try:
                    self.email_service.send_transaction_notification(
                        user_email=receiver_info['email'],
                        user_name=receiver_info['full_name'],
                        transaction_type='deposit',  # For receiver, it's a deposit
                        amount=amount,
                        account_number=receiver_info['account_number'],
                        balance=receiver_new_balance,
                        description=f"Transfer received from {sender_info['account_number']}: {description}"
                    )
                except Exception as e:
                    print(f"Error sending transfer email notification to receiver: {e}")
                
                return True, "Transfer successful"
            except Error as e:
                print(f"Error processing transfer: {e}")
                connection.rollback()
                return False, str(e)
            finally:
                cursor.close()
                connection.close()
    
    def get_transactions(self, account_id, limit=10):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                query = """
                SELECT t.*, 
                       fa.account_number as from_account_number,
                       ta.account_number as to_account_number
                FROM transactions t
                LEFT JOIN accounts fa ON t.from_account_id = fa.account_id
                LEFT JOIN accounts ta ON t.to_account_id = ta.account_id
                WHERE t.from_account_id = %s OR t.to_account_id = %s
                ORDER BY t.transaction_date DESC
                LIMIT %s
                """
                cursor.execute(query, (account_id, account_id, limit))
                return cursor.fetchall()
            except Error as e:
                print(f"Error fetching transactions: {e}")
                return []
            finally:
                cursor.close()
                connection.close()