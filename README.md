# Banking System

A modern web-based banking system built with Flask and MySQL. This application provides secure user authentication, account management, money transfers, and transaction history.

## Features

- **User Authentication**: Secure registration and login system
- **Account Management**: Create and manage multiple bank accounts
- **Money Transfers**: Transfer money between accounts
- **Deposits & Withdrawals**: Manage account balances
- **Transaction History**: View detailed transaction records
- **Responsive Design**: Modern, mobile-friendly interface
- **Security**: Password hashing and session management

## Technology Stack

- **Backend**: Python Flask
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Security**: Werkzeug password hashing

## Installation & Setup

### Prerequisites

- Python 3.7+
- MySQL 5.7+
- pip (Python package installer)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd banking-system
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

1. **Start MySQL service**:
   ```bash
   # On Ubuntu/Debian
   sudo systemctl start mysql
   
   # On macOS with Homebrew
   brew services start mysql
   
   # On Windows
   net start mysql
   ```

2. **Run the setup script**:
   ```bash
   python setup.py
   ```

   This will:
   - Create the `banking_system` database
   - Create all necessary tables
   - Insert sample data (branches, users, accounts)
   - Create an admin user for testing

### 4. Configure Database Connection

Update the database credentials in `model.py` if needed:

```python
class Database:
    def __init__(self):
        self.host = 'localhost'
        self.user = 'root'
        self.password = 'your_mysql_password'  # Update this
        self.database = 'banking_system'
```

### 5. Run the Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Usage

### Sample Login Credentials

After running the setup script, you can login with:

- **Username**: `admin`
- **Password**: `admin123`

Or register a new account through the web interface.

### Available Sample Accounts

The setup script creates sample users with accounts:

1. **John Doe** (john_doe / password123)
   - Savings Account: $5,000
   - Current Account: $2,500

2. **Jane Smith** (jane_smith / password123)
   - Savings Account: $7,500

3. **Bob Wilson** (bob_wilson / password123)
   - Current Account: $1,200

## Project Structure

```
banking-system/
├── app.py                 # Main Flask application
├── model.py              # Database models and operations
├── tables.sql            # Database schema and sample data
├── setup.py              # Database setup script
├── requirements.txt      # Python dependencies
├── README.md            # This file
└── templates/           # HTML templates
    ├── index.html       # Home page
    ├── login.html       # Login page
    ├── register.html    # Registration page
    ├── dashboard.html   # User dashboard
    ├── accounts.html    # Account management
    ├── transfer.html    # Money transfer
    ├── create_account.html # Create new account
    └── transactions.html   # Transaction history
```

## API Endpoints

- `GET /` - Home page
- `GET/POST /register` - User registration
- `GET/POST /login` - User login
- `GET /dashboard` - User dashboard
- `GET /accounts` - Account management
- `POST /deposit` - Make deposit
- `POST /withdraw` - Make withdrawal
- `GET/POST /transfer` - Money transfer
- `GET/POST /create_account` - Create new account
- `GET /transactions/<account_id>` - Transaction history
- `GET /logout` - User logout

## Database Schema

### Tables

1. **users** - User accounts and authentication
2. **branches** - Bank branch information
3. **accounts** - Bank accounts
4. **transactions** - Transaction records
5. **beneficiaries** - Quick transfer beneficiaries

## Security Features

- Password hashing using Werkzeug
- Session-based authentication
- SQL injection prevention with parameterized queries
- Input validation and sanitization
- Secure session management

## Development

### Adding New Features

1. Update the database schema in `tables.sql` if needed
2. Add new methods to the model classes in `model.py`
3. Create new routes in `app.py`
4. Create corresponding HTML templates
5. Update the navigation and UI as needed

### Testing

1. Use the sample data created by `setup.py`
2. Test all user flows: registration, login, transfers, etc.
3. Verify database transactions and data integrity

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**:
   - Ensure MySQL is running
   - Check database credentials in `model.py`
   - Verify database exists: `SHOW DATABASES;`

2. **Import Errors**:
   - Install all dependencies: `pip install -r requirements.txt`
   - Check Python version compatibility

3. **Template Not Found**:
   - Ensure all HTML files are in the `templates/` directory
   - Check file names match route references

### Database Reset

To reset the database:

```sql
DROP DATABASE banking_system;
```

Then run `python setup.py` again.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
