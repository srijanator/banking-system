import requests
import os
from datetime import datetime

class EmailService:
    def __init__(self):
        # Use environment variables for security (fallback to hardcoded for development)
        self.api_key = os.getenv('MAILJET_API_KEY', '0a3c09ab8d1565ab903529aeb62d5fad')
        self.secret_key = os.getenv('MAILJET_SECRET_KEY', '1a928ab09d6d44bb39d96498993374c6')
        self.from_email = os.getenv('FROM_EMAIL', 'sr@createhub.fun')
        self.from_name = os.getenv('FROM_NAME', 'CreateHub Bank')
        self.base_url = 'https://api.mailjet.com/v3.1/send'
    
    def send_transaction_notification(self, user_email, user_name, transaction_type, amount, account_number, balance, description=""):
        """Send email notification for banking transactions"""
        
        # Format amount and balance
        formatted_amount = f"₹{amount:,.2f}"
        formatted_balance = f"₹{balance:,.2f}"
        
        # Create subject based on transaction type
        subjects = {
            'deposit': f'Deposit Confirmation - {formatted_amount}',
            'withdrawal': f'Withdrawal Notification - {formatted_amount}',
            'transfer': f'Transfer Notification - {formatted_amount}'
        }
        
        subject = subjects.get(transaction_type, f'Transaction Notification - {formatted_amount}')
        
        # Create HTML content based on transaction type
        if transaction_type == 'deposit':
            html_content = self._create_deposit_email_html(user_name, formatted_amount, account_number, formatted_balance, description)
            text_content = f"Hello {user_name},\n\nA deposit of {formatted_amount} has been made to your account {account_number}.\nYour new balance is {formatted_balance}.\n\nDescription: {description}\n\nThank you for banking with us!"
            
        elif transaction_type == 'withdrawal':
            html_content = self._create_withdrawal_email_html(user_name, formatted_amount, account_number, formatted_balance, description)
            text_content = f"Hello {user_name},\n\nA withdrawal of {formatted_amount} has been made from your account {account_number}.\nYour new balance is {formatted_balance}.\n\nDescription: {description}\n\nThank you for banking with us!"
            
        elif transaction_type == 'transfer':
            html_content = self._create_transfer_email_html(user_name, formatted_amount, account_number, formatted_balance, description)
            text_content = f"Hello {user_name},\n\nA transfer of {formatted_amount} has been processed from your account {account_number}.\nYour new balance is {formatted_balance}.\n\nDescription: {description}\n\nThank you for banking with us!"
        
        email_data = {
            'Messages': [{
                'From': {'Email': self.from_email, 'Name': self.from_name},
                'To': [{'Email': user_email, 'Name': user_name}],
                'Subject': subject,
                'TextPart': text_content,
                'HTMLPart': html_content
            }]
        }

        #try cath for debuggings
        
        try:
            response = requests.post(
                self.base_url,
                auth=(self.api_key, self.secret_key),
                json=email_data,
                timeout=30
            )
            
            if response.status_code == 200:
                print(f'✅ Email notification sent successfully to {user_email}')
                return True
            else:
                print(f'❌ Email sending failed for {user_email}: {response.text}')
                return False
                
        except requests.exceptions.RequestException as e:
            print(f'❌ Network error sending email to {user_email}: {e}')
            return False
        except Exception as e:
            print(f'❌ Unexpected error sending email to {user_email}: {e}')
            return False
    
    def _create_deposit_email_html(self, user_name, amount, account_number, balance, description):
        return f'''
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">💰 Deposit Confirmation</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>{user_name}</strong>,</p>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <h3 style="color: #28a745; margin-top: 0;">✅ Deposit Successful</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #28a745; margin: 10px 0;">{amount}</p>
                        <p style="margin: 5px 0;"><strong>Account:</strong> {account_number}</p>
                        <p style="margin: 5px 0;"><strong>New Balance:</strong> {balance}</p>
                        {f'<p style="margin: 5px 0;"><strong>Description:</strong> {description}</p>' if description else ''}
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Transaction processed on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center;">
                        <p style="color: #666; font-size: 14px;">Thank you for banking with CreateHub Bank!</p>
                        <p style="color: #999; font-size: 12px;">If you did not make this transaction, please contact us immediately.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        '''
    
    def _create_withdrawal_email_html(self, user_name, amount, account_number, balance, description):
        return f'''
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">💳 Withdrawal Notification</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>{user_name}</strong>,</p>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h3 style="color: #ffc107; margin-top: 0;">⚠️ Withdrawal Processed</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #dc3545; margin: 10px 0;">-{amount}</p>
                        <p style="margin: 5px 0;"><strong>Account:</strong> {account_number}</p>
                        <p style="margin: 5px 0;"><strong>New Balance:</strong> {balance}</p>
                        {f'<p style="margin: 5px 0;"><strong>Description:</strong> {description}</p>' if description else ''}
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Transaction processed on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center;">
                        <p style="color: #666; font-size: 14px;">Thank you for banking with CreateHub Bank!</p>
                        <p style="color: #999; font-size: 12px;">If you did not make this transaction, please contact us immediately.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        '''
    
    def _create_transfer_email_html(self, user_name, amount, account_number, balance, description):
        return f'''
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">🔄 Transfer Notification</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>{user_name}</strong>,</p>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                        <h3 style="color: #17a2b8; margin-top: 0;">📤 Transfer Processed</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #dc3545; margin: 10px 0;">-{amount}</p>
                        <p style="margin: 5px 0;"><strong>From Account:</strong> {account_number}</p>
                        <p style="margin: 5px 0;"><strong>New Balance:</strong> {balance}</p>
                        {f'<p style="margin: 5px 0;"><strong>Description:</strong> {description}</p>' if description else ''}
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Transaction processed on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center;">
                        <p style="color: #666; font-size: 14px;">Thank you for banking with CreateHub Bank!</p>
                        <p style="color: #999; font-size: 12px;">If you did not make this transaction, please contact us immediately.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        '''
