# Email Notifications for Banking System

## Overview
This banking system now includes automated email notifications for all transaction types: deposits, withdrawals, and transfers.

## Features

### Transaction Types Supported
1. **Deposit Notifications** - Sent when money is deposited into an account
2. **Withdrawal Notifications** - Sent when money is withdrawn from an account  
3. **Transfer Notifications** - Sent to both sender and receiver during transfers

### Email Service Features
- Professional, responsive HTML email templates
- Transaction details including amount, account number, new balance, and description
- Timestamp information
- Security notice about unauthorized transactions
- Color-coded styling for different transaction types

## Implementation Details

### Files Modified/Created

1. **email_service.py** (New)
   - `EmailService` class with Mailjet integration
   - Methods for creating HTML email templates
   - Transaction notification method

2. **model.py** (Modified)
   - Added `EmailService` import and initialization in `Transaction` class
   - Updated `deposit()`, `withdraw()`, and `transfer()` methods to send email notifications
   - Added helper queries to fetch user information for notifications

3. **app.py** (Modified)
   - Updated deposit route to handle new return format from transaction methods

### Email Templates
Each transaction type has a custom HTML template:
- **Deposit**: Green-themed with positive messaging
- **Withdrawal**: Orange-themed with warning styling  
- **Transfer**: Blue-themed for transfer operations

## Configuration

### Environment Variables
Set these environment variables for production:
```bash
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
FROM_EMAIL=alerts@createhub.fun
FROM_NAME=CreateHub Bank
```

### Mailjet Setup
The system uses Mailjet for email delivery. The configuration is already set up with:
- API endpoints: `https://api.mailjet.com/v3.1/send`
- From email: `alerts@createhub.fun`
- From name: `CreateHub Bank`

## Testing

Run the test script to verify email functionality:
```bash
python test_email_notifications.py
```

## Usage

Email notifications are automatically sent when:
1. A user makes a deposit
2. A user makes a withdrawal
3. A user transfers money (both parties receive notifications)

The notifications include:
- Transaction type and amount
- Account number
- New account balance
- Transaction description
- Timestamp

## Error Handling

- Email sending failures are logged but don't affect transaction processing
- Database transactions are committed regardless of email status
- Graceful error handling ensures banking operations continue even if email service fails

## Security

- Email credentials are loaded from environment variables in production
- Transaction notifications include security warnings about unauthorized activity
- Email sending errors are logged but not exposed to users
