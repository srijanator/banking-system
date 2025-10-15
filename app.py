from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from model import Database, User, BankAccount, Transaction
from mysql.connector import Error

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

# Initialize database and models
db = Database()
user_model = User(db)
account_model = BankAccount(db)
transaction_model = Transaction(db)

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        full_name = request.form['full_name']
        phone = request.form['phone']
        
        user_id = user_model.create_user(username, password, email, full_name, phone)
        if user_id:
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Registration failed. Please try again.', 'error')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = user_model.authenticate_user(username, password)
        if user:
            session['user_id'] = user['user_id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    accounts = account_model.get_accounts(session['user_id'])
    return render_template('dashboard.html', accounts=accounts)

@app.route('/accounts')
def accounts():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    accounts = account_model.get_accounts(session['user_id'])
    return render_template('accounts.html', accounts=accounts)

@app.route('/deposit', methods=['POST'])
def deposit():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    account_id = request.form['account_id']
    amount = float(request.form['amount'])
    description = request.form.get('description', '')
    
    success = transaction_model.deposit(account_id, amount, description)
    if success:
        flash('Deposit successful!', 'success')
    else:
        flash('Deposit failed. Please try again.', 'error')
    
    return redirect(url_for('accounts'))

@app.route('/transfer', methods=['GET', 'POST'])
def transfer():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        from_account_id = request.form['from_account_id']
        to_account_number = request.form['to_account_number']
        amount = float(request.form['amount'])
        description = request.form.get('description', '')
        
        success, message = transaction_model.transfer(from_account_id, to_account_number, amount, description)
        if success:
            flash('Transfer successful!', 'success')
        else:
            flash(f'Transfer failed: {message}', 'error')
        
        return redirect(url_for('accounts'))
    
    accounts = account_model.get_accounts(session['user_id'])
    return render_template('transfer.html', accounts=accounts)

@app.route('/withdraw', methods=['POST'])
def withdraw():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    account_id = request.form['account_id']
    amount = float(request.form['amount'])
    description = request.form.get('description', '')
    
    success, message = transaction_model.withdraw(account_id, amount, description)
    if success:
        flash('Withdrawal successful!', 'success')
    else:
        flash(f'Withdrawal failed: {message}', 'error')
    
    return redirect(url_for('accounts'))

@app.route('/create_account', methods=['GET', 'POST'])
def create_account():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        branch_id = request.form['branch_id']
        account_type = request.form['account_type']
        
        account_number = account_model.create_account(session['user_id'], branch_id, account_type)
        if account_number:
            flash(f'Account created successfully! Account number: {account_number}', 'success')
            return redirect(url_for('accounts'))
        else:
            flash('Account creation failed. Please try again.', 'error')
    
    # Get branches for the form
    connection = db.get_connection()
    branches = []
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM branches")
            branches = cursor.fetchall()
        except Error as e:
            print(f"Error fetching branches: {e}")
        finally:
            cursor.close()
            connection.close()
    
    return render_template('create_account.html', branches=branches)

@app.route('/transactions/<int:account_id>')
def transactions(account_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Verify account belongs to user
    accounts = account_model.get_accounts(session['user_id'])
    account = next((acc for acc in accounts if acc['account_id'] == account_id), None)
    
    if not account:
        flash('Account not found or access denied.', 'error')
        return redirect(url_for('accounts'))
    
    transactions = transaction_model.get_transactions(account_id)
    return render_template('transactions.html', account=account, transactions=transactions)

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)