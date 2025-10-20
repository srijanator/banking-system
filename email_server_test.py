import requests
import os

def test_mailjet():
    # Use environment variables for security (fallback to hardcoded for testing)
    api_key = os.getenv('MAILJET_API_KEY', '0a3c09ab8d1565ab903529aeb62d5fad')
    secret_key = os.getenv('MAILJET_SECRET_KEY', '1a928ab09d6d44bb39d96498993374c6')
    
    email_data = {
        'Messages': [{
            'From': {'Email': 'alerts@createhub.fun', 'Name': 'CreateHub Bank'},
            'To': [{'Email': 'srijanpainuly5@gmail.com', 'Name': 'Test User'}],
            'Subject': 'Domain Test - Mailjet',
            'TextPart': 'Your domain is properly configured with Mailjet!',
            'HTMLPart': '''
            <html>
            <body>
                <h3>Domain Test - Mailjet</h3>
                <p>Your domain <strong>createhub.fun</strong> is properly configured with Mailjet!</p>
                <p>You can now send emails from <code>alerts@createhub.fun</code></p>
            </body>
            </html>
            '''
        }]
    }
    
    try:
        response = requests.post(
            'https://api.mailjet.com/v3.1/send',
            auth=(api_key, secret_key),
            json=email_data,
            timeout=30
        )
        
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            print('✅ Email sent successfully!')
            print(f'Response: {result}')
        else:
            print('❌ Email sending failed!')
            print(f'Error: {response.text}')
            
    except requests.exceptions.RequestException as e:
        print(f'❌ Network error: {e}')
    except Exception as e:
        print(f'❌ Unexpected error: {e}')

if __name__ == "__main__":
    test_mailjet()