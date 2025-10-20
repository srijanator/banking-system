#!/usr/bin/env python3
"""
Test script for email notification service
"""

from email_service import EmailService

def test_email_notifications():
    """Test the email notification service"""
    email_service = EmailService()
    
    # Test email details (replace with a real email for testing)
    test_email = "srijanpainuly5@gmail.com"  # Update this to your test email
    test_name = "Test User"
    
    print("Testing email notifications...")
    
    # Test deposit notification
    print("\n1. Testing deposit notification...")
    result = email_service.send_transaction_notification(
        user_email=test_email,
        user_name=test_name,
        transaction_type='deposit',
        amount=500.00,
        account_number='123456789012',
        balance=2500.00,
        description='Test deposit for email notification'
    )
    print(f"Deposit notification result: {'✅ Success' if result else '❌ Failed'}")
    
    # Test withdrawal notification
    print("\n2. Testing withdrawal notification...")
    result = email_service.send_transaction_notification(
        user_email=test_email,
        user_name=test_name,
        transaction_type='withdrawal',
        amount=100.00,
        account_number='123456789012',
        balance=2400.00,
        description='Test withdrawal for email notification'
    )
    print(f"Withdrawal notification result: {'✅ Success' if result else '❌ Failed'}")
    
    # Test transfer notification
    print("\n3. Testing transfer notification...")
    result = email_service.send_transaction_notification(
        user_email=test_email,
        user_name=test_name,
        transaction_type='transfer',
        amount=200.00,
        account_number='123456789012',
        balance=2200.00,
        description='Test transfer for email notification'
    )
    print(f"Transfer notification result: {'✅ Success' if result else '❌ Failed'}")

if __name__ == "__main__":
    test_email_notifications()
