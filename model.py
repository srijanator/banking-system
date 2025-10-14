import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string

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
                query = """
                INSERT INTO accounts (user_id, branch_id, account_number, account_type)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(query, (user_id, branch_id, account_number, account_type))
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

class Transaction:
    def __init__(self, db):
        self.db = db
    
    def deposit(self, account_id, amount, description=""):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor()
                
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
                return True
            except Error as e:
                print(f"Error processing deposit: {e}")
                connection.rollback()
                return False
            finally:
                cursor.close()
                connection.close()
    
    def withdraw(self, account_id, amount, description=""):
        connection = self.db.get_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                
                # Check if account has sufficient balance
                balance_query = "SELECT balance FROM accounts WHERE account_id = %s"
                cursor.execute(balance_query, (account_id,))
                account_balance = cursor.fetchone()['balance']
                
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
                
                # Check if sender has sufficient balance
                balance_query = "SELECT balance FROM accounts WHERE account_id = %s"
                cursor.execute(balance_query, (from_account_id,))
                sender_balance = cursor.fetchone()['balance']
                
                if sender_balance < amount:
                    return False, "Insufficient balance"
                
                # Get receiver account ID
                receiver_query = "SELECT account_id FROM accounts WHERE account_number = %s"
                cursor.execute(receiver_query, (to_account_number,))
                receiver_account = cursor.fetchone()
                
                if not receiver_account:
                    return False, "Receiver account not found"
                
                to_account_id = receiver_account['account_id']
                
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