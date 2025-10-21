// Enhanced Banking Accounts Management

document.addEventListener('DOMContentLoaded', function() {
    initializeAccountsPage();
    initializeModals();
    initializeFormValidation();
    addAccountAnimations();
    initializeRealTimeUpdates();
});

function initializeAccountsPage() {
    // Add loading animations to account cards
    const accountCards = document.querySelectorAll('.account-card');
    accountCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // Add balance counting animation
    animateBalances();
    
    // Initialize withdrawal balance display
    const withdrawSelect = document.getElementById('withdraw_account_id');
    if (withdrawSelect) {
        withdrawSelect.addEventListener('change', updateWithdrawBalance);
    }
}

function animateBalances() {
    const balanceElements = document.querySelectorAll('.account-card h3');
    balanceElements.forEach(element => {
        const text = element.textContent.trim();
        const match = text.match(/Rs\s*([\d,]+\.?\d*)/);
        if (match) {
            const finalAmount = parseFloat(match[1].replace(/,/g, ''));
            animateNumber(element, 0, finalAmount, 'Rs ');
        }
    });
}

function animateNumber(element, start, end, prefix = '', duration = 2000) {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = prefix + current.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, 16);
}

function initializeModals() {
    // Enhanced modal animations
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function() {
            const modalContent = this.querySelector('.modal-content');
            modalContent.style.transform = 'scale(0.8) translateY(-50px)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s ease-out';
                modalContent.style.transform = 'scale(1) translateY(0)';
                modalContent.style.opacity = '1';
            }, 100);
        });
    });
}

function initializeFormValidation() {
    // Real-time validation for deposit form
    const depositForm = document.querySelector('#depositModal form');
    if (depositForm) {
        initializeDepositValidation(depositForm);
    }
    
    // Real-time validation for withdrawal form
    const withdrawForm = document.querySelector('#withdrawModal form');
    if (withdrawForm) {
        initializeWithdrawValidation(withdrawForm);
    }
}

function initializeDepositValidation(form) {
    const amountInput = form.querySelector('input[name="amount"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            const amount = parseFloat(this.value);
            const isValid = !isNaN(amount) && amount > 0 && amount <= 100000;
            
            this.classList.remove('is-valid', 'is-invalid');
            if (this.value) {
                this.classList.add(isValid ? 'is-valid' : 'is-invalid');
            }
            
            // Show amount info
            showAmountInfo(this, amount, 'deposit');
            
            if (submitBtn) {
                submitBtn.disabled = !isValid || !this.value;
            }
        });
    }
}

function initializeWithdrawValidation(form) {
    const amountInput = form.querySelector('input[name="amount"]');
    const accountSelect = form.querySelector('select[name="account_id"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            const amount = parseFloat(this.value);
            const selectedOption = accountSelect.options[accountSelect.selectedIndex];
            const balance = parseFloat(selectedOption.getAttribute('data-balance') || 0);
            
            const isValid = !isNaN(amount) && amount > 0 && amount <= balance;
            
            this.classList.remove('is-valid', 'is-invalid');
            if (this.value) {
                this.classList.add(isValid ? 'is-valid' : 'is-invalid');
            }
            
            // Show amount info
            showAmountInfo(this, amount, 'withdraw', balance);
            
            if (submitBtn) {
                submitBtn.disabled = !isValid || !this.value;
            }
        });
    }
}

function showAmountInfo(input, amount, type, balance = null) {
    // Remove existing info
    const existingInfo = input.parentElement.querySelector('.amount-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    if (isNaN(amount) || amount <= 0) return;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'amount-info mt-2 small';
    
    let message = '';
    let className = 'text-info';
    
    if (type === 'deposit') {
        if (amount > 50000) {
            message = '⚠️ Large deposit - may require verification';
            className = 'text-warning';
        } else if (amount > 10000) {
            message = '💰 Substantial deposit amount';
            className = 'text-success';
        } else {
            message = '✅ Valid deposit amount';
            className = 'text-success';
        }
    } else if (type === 'withdraw') {
        if (amount > balance) {
            message = '❌ Amount exceeds available balance';
            className = 'text-danger';
        } else if (amount > balance * 0.8) {
            message = '⚠️ Large withdrawal - confirm amount';
            className = 'text-warning';
        } else {
            message = '✅ Valid withdrawal amount';
            className = 'text-success';
        }
    }
    
    infoDiv.className += ' ' + className;
    infoDiv.textContent = message;
    input.parentElement.appendChild(infoDiv);
}

function addAccountAnimations() {
    // Add hover effects to account action buttons
    const actionButtons = document.querySelectorAll('.account-card .btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add ripple effect to account cards
    const accountCards = document.querySelectorAll('.account-card');
    accountCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('a')) return;
            addRippleEffect(this, e);
        });
    });
}

function addRippleEffect(element, event) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

function initializeRealTimeUpdates() {
    // Simulate real-time balance updates (placeholder)
    setInterval(() => {
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            if (badge.textContent === 'Active') {
                badge.style.animation = 'pulse 2s infinite';
            }
        });
    }, 5000);
}

function updateWithdrawBalance() {
    const selectedOption = this.options[this.selectedIndex];
    const balanceElement = document.getElementById('withdraw-balance');
    
    if (selectedOption && selectedOption.getAttribute('data-balance') && balanceElement) {
        const balance = selectedOption.getAttribute('data-balance');
        const formattedBalance = 'Rs ' + parseFloat(balance).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        balanceElement.textContent = formattedBalance;
        balanceElement.classList.add('text-success', 'fw-bold');
        
        // Add animation
        balanceElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            balanceElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Enhanced modal functions
function showDepositModal(accountId) {
    document.getElementById('account_id').value = accountId;
    
    // Add success probability indicator
    setTimeout(() => {
        const modalBody = document.querySelector('#depositModal .modal-body');
        const successIndicator = document.createElement('div');
        successIndicator.className = 'alert alert-success mt-3';
        successIndicator.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            <strong>Secure Transaction:</strong> Your deposit will be processed instantly and securely.
        `;
        
        const existingIndicator = modalBody.querySelector('.alert');
        if (!existingIndicator) {
            modalBody.appendChild(successIndicator);
        }
    }, 300);
    
    new bootstrap.Modal(document.getElementById('depositModal')).show();
}

function showWithdrawModal(accountId) {
    document.getElementById('withdraw_account_id').value = accountId;
    updateWithdrawBalance.call(document.getElementById('withdraw_account_id'));
    
    // Add security notice
    setTimeout(() => {
        const modalBody = document.querySelector('#withdrawModal .modal-body');
        const securityNotice = document.createElement('div');
        securityNotice.className = 'alert alert-info mt-3';
        securityNotice.innerHTML = `
            <i class="fas fa-shield-alt me-2"></i>
            <strong>Security Notice:</strong> Withdrawals are processed securely with SMS verification.
        `;
        
        const existingNotice = modalBody.querySelector('.alert');
        if (!existingNotice) {
            modalBody.appendChild(securityNotice);
        }
    }, 300);
    
    new bootstrap.Modal(document.getElementById('withdrawModal')).show();
}

function showAccountDetails(accountId, accountNumber, accountType, balance, interest, branchName, status, createdDate) {
    // Populate account details with enhanced formatting
    document.getElementById('detail-account-number').textContent = formatAccountNumber(accountNumber);
    document.getElementById('detail-account-type').textContent = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    
    const statusElement = document.getElementById('detail-status');
    statusElement.innerHTML = `<span class="badge bg-${status === 'active' ? 'success' : 'secondary'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    
    document.getElementById('detail-interest').textContent = interest + '% per annum';
    document.getElementById('detail-created').textContent = formatDate(createdDate);

    // Format balance with animation
    const balanceElement = document.getElementById('detail-balance');
    balanceElement.textContent = formatCurrency(balance);
    
    document.getElementById('detail-branch').textContent = branchName;
    document.getElementById('detail-account-id').textContent = '#' + accountId;

    // Update summary section
    document.getElementById('summary-balance').textContent = formatCurrency(balance);
    document.getElementById('summary-interest').textContent = interest + '%';
    document.getElementById('summary-status').textContent = status.charAt(0).toUpperCase() + status.slice(1);

    // Configure account features based on type
    updateAccountFeatures(accountType);
    
    // Add account health score
    addAccountHealthScore(balance, interest, status);
    
    // Show modal with animation
    const modal = new bootstrap.Modal(document.getElementById('accountDetailsModal'));
    modal.show();
    
    // Animate the modal content
    setTimeout(() => {
        const modalContent = document.querySelector('#accountDetailsModal .modal-content');
        modalContent.style.animation = 'modalSlideIn 0.4s ease-out';
    }, 100);
}

function formatAccountNumber(accountNumber) {
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatCurrency(amount) {
    return 'Rs ' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function updateAccountFeatures(accountType) {
    const features = {
        'savings': { 
            'online-banking': true, 
            'mobile-app': true, 
            'debit-card': true, 
            'checks': false 
        },
        'current': { 
            'online-banking': true, 
            'mobile-app': true, 
            'debit-card': true, 
            'checks': true 
        }
    };
    
    const accountFeatures = features[accountType] || features['savings'];
    
    Object.keys(accountFeatures).forEach(feature => {
        const element = document.getElementById('feature-' + feature);
        if (element) {
            element.style.display = accountFeatures[feature] ? 'block' : 'none';
            if (accountFeatures[feature]) {
                element.classList.add('feature-available');
            }
        }
    });
}

function addAccountHealthScore(balance, interest, status) {
    // Calculate a simple health score based on balance, interest, and status
    let score = 0;
    
    if (status === 'active') score += 40;
    if (balance > 10000) score += 30;
    else if (balance > 1000) score += 20;
    else if (balance > 0) score += 10;
    
    if (interest >= 4) score += 30;
    else if (interest >= 2) score += 20;
    else score += 10;
    
    let healthText, healthClass;
    if (score >= 90) {
        healthText = 'Excellent';
        healthClass = 'text-success';
    } else if (score >= 70) {
        healthText = 'Good';
        healthClass = 'text-info';
    } else if (score >= 50) {
        healthText = 'Average';
        healthClass = 'text-warning';
    } else {
        healthText = 'Needs Attention';
        healthClass = 'text-danger';
    }
    
    // Add health score to summary if element exists
    const summarySection = document.querySelector('#accountDetailsModal .row.mt-3 .col-12 .card-body .row');
    if (summarySection && !document.getElementById('health-score')) {
        const healthDiv = document.createElement('div');
        healthDiv.className = 'col-md-4 text-center';
        healthDiv.innerHTML = `
            <div class="metric-icon mb-2">
                <i class="fas fa-heart fa-2x ${healthClass}"></i>
            </div>
            <h6 class="text-muted">Account Health</h6>
            <p class="mb-0 ${healthClass}" id="health-score">${healthText}</p>
        `;
        summarySection.appendChild(healthDiv);
    }
}

function printAccountDetails() {
    // Create a clean print version
    const modalContent = document.getElementById('accountDetailsModal').cloneNode(true);
    
    // Remove buttons and interactive elements
    const buttons = modalContent.querySelectorAll('button, .btn-close');
    buttons.forEach(btn => btn.remove());
    
    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Account Details - SecureBank</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333; 
                    line-height: 1.6;
                }
                .print-header {
                    text-align: center;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .print-header h1 {
                    color: #667eea;
                    margin: 0;
                }
                .modal-content { border: none; box-shadow: none; }
                .modal-header { 
                    background: #f8f9fa; 
                    color: #333; 
                    border-radius: 0;
                    padding: 15px;
                }
                .card { 
                    border: 1px solid #ddd; 
                    margin-bottom: 20px;
                    border-radius: 8px;
                }
                .card-header { 
                    background: #f8f9fa; 
                    font-weight: bold; 
                    padding: 10px 15px;
                }
                .badge { 
                    padding: 5px 10px; 
                    border-radius: 15px; 
                    font-size: 12px;
                }
                .bg-success { background: #28a745 !important; color: white; }
                .text-success { color: #28a745 !important; }
                .print-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                    .print-footer { position: fixed; bottom: 0; width: 100%; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>🏦 SecureBank</h1>
                <h2>Account Details Report</h2>
            </div>
            ${modalContent.innerHTML}
            <div class="print-footer">
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>This document is computer generated and does not require a signature.</p>
                <p><strong>SecureBank</strong> - Your trusted banking partner</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}
