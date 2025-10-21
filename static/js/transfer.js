document.addEventListener('DOMContentLoaded', function() {
    initializeTransferForm();
    initializeRealTimeValidation();
    initializeAmountInput();
    initializeAccountValidation();
    addVisualEnhancements();
});

// Initialize transfer form functionality
function initializeTransferForm() {
    const fromSelect = document.getElementById('from_account_id');
    const availableBalanceSpan = document.getElementById('available-balance');
    
    if (fromSelect && availableBalanceSpan) {
        fromSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const balance = selectedOption.getAttribute('data-balance');
            
            if (balance) {
                const formattedBalance = 'Rs ' + parseFloat(balance).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                availableBalanceSpan.textContent = formattedBalance;
                availableBalanceSpan.classList.add('text-success');
                
                // Add animation
                availableBalanceSpan.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    availableBalanceSpan.style.transform = 'scale(1)';
                }, 200);
            } else {
                availableBalanceSpan.textContent = 'Rs 0.00';
                availableBalanceSpan.classList.remove('text-success');
            }
            
            validateAmount();
        });
    }
}

// Real-time validation for all form fields
function initializeRealTimeValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    // Enhanced form submission with validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateAllFields()) {
            showConfirmationModal();
        }
    });
    
    // Real-time validation for each field
    const fields = ['from_account_id', 'to_account_number', 'amount', 'description'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => validateField(fieldId));
            field.addEventListener('blur', () => validateField(fieldId));
        }
    });
}

// Enhanced amount input with formatting and validation
function initializeAmountInput() {
    const amountInput = document.getElementById('amount');
    if (!amountInput) return;
    
    amountInput.addEventListener('input', function() {
        // Remove non-numeric characters except decimal point
        let value = this.value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limit decimal places to 2
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        this.value = value;
        validateAmount();
    });
    
    // Add visual feedback for amount ranges
    amountInput.addEventListener('keyup', function() {
        const amount = parseFloat(this.value);
        const amountGroup = this.closest('.input-group');
        
        if (amount > 0 && amount <= 1000) {
            amountGroup.classList.remove('border-warning', 'border-danger');
            amountGroup.classList.add('border-success');
        } else if (amount > 1000 && amount <= 5000) {
            amountGroup.classList.remove('border-success', 'border-danger');
            amountGroup.classList.add('border-warning');
        } else if (amount > 5000) {
            amountGroup.classList.remove('border-success', 'border-warning');
            amountGroup.classList.add('border-danger');
        } else {
            amountGroup.classList.remove('border-success', 'border-warning', 'border-danger');
        }
    });
}

// Account number validation with formatting
function initializeAccountValidation() {
    const accountInput = document.getElementById('to_account_number');
    if (!accountInput) return;
    
    accountInput.addEventListener('input', function() {
        // Remove non-numeric characters
        let value = this.value.replace(/[^0-9]/g, '');
        
        // Format with spaces for better readability (xxxx xxxx xxxx)
        if (value.length > 4) {
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        }
        
        this.value = value;
        validateAccountNumber();
    });
    
    accountInput.addEventListener('paste', function(e) {
        setTimeout(() => {
            this.value = this.value.replace(/[^0-9]/g, '');
            validateAccountNumber();
        }, 0);
    });
}

// Validate individual fields
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return false;
    
    let isValid = true;
    let message = '';
    
    switch (fieldId) {
        case 'from_account_id':
            isValid = field.value !== '';
            message = isValid ? '' : 'Please select a source account';
            break;
            
        case 'to_account_number':
            const accountNumber = field.value.replace(/\s/g, '');
            isValid = accountNumber.length === 12 && /^\d+$/.test(accountNumber);
            message = isValid ? '' : 'Account number must be 12 digits';
            break;
            
        case 'amount':
            return validateAmount();
            
        case 'description':
            // Optional field, always valid
            isValid = true;
            break;
    }
    
    showFieldValidation(field, isValid, message);
    return isValid;
}

// Comprehensive amount validation
function validateAmount() {
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('from_account_id');
    
    if (!amountInput || !fromSelect) return false;
    
    const amount = parseFloat(amountInput.value);
    const selectedOption = fromSelect.options[fromSelect.selectedIndex];
    const balance = parseFloat(selectedOption.getAttribute('data-balance') || 0);
    
    let isValid = true;
    let message = '';
    
    if (isNaN(amount) || amount <= 0) {
        isValid = false;
        message = 'Please enter a valid amount';
    } else if (amount < 1) {
        isValid = false;
        message = 'Minimum transfer amount is Rs 1';
    } else if (amount > balance) {
        isValid = false;
        message = 'Insufficient balance';
    } else if (amount > 10000) {
        isValid = false;
        message = 'Amount exceeds daily limit of Rs 10,000';
    } else if (amount > 5000) {
        message = 'High amount - please verify';
    }
    
    showFieldValidation(amountInput, isValid, message);
    return isValid;
}

// Account number validation
function validateAccountNumber() {
    const accountInput = document.getElementById('to_account_number');
    const fromSelect = document.getElementById('from_account_id');
    
    if (!accountInput || !fromSelect) return false;
    
    const toAccountNumber = accountInput.value.replace(/\s/g, '');
    const fromAccountOption = fromSelect.options[fromSelect.selectedIndex];
    const fromAccountNumber = fromAccountOption.textContent.match(/\d{12}/);
    
    let isValid = true;
    let message = '';
    
    if (toAccountNumber.length === 0) {
        isValid = false;
        message = 'Please enter account number';
    } else if (toAccountNumber.length !== 12) {
        isValid = false;
        message = 'Account number must be 12 digits';
    } else if (!/^\d+$/.test(toAccountNumber)) {
        isValid = false;
        message = 'Account number must contain only digits';
    } else if (fromAccountNumber && toAccountNumber === fromAccountNumber[0]) {
        isValid = false;
        message = 'Cannot transfer to the same account';
    }
    
    showFieldValidation(accountInput, isValid, message);
    return isValid;
}

// Show validation feedback for fields
function showFieldValidation(field, isValid, message) {
    // Remove existing feedback
    field.classList.remove('is-valid', 'is-invalid');
    
    const existingFeedback = field.parentElement.querySelector('.invalid-feedback, .valid-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Add new feedback
    if (field.value && !isValid) {
        field.classList.add('is-invalid');
        if (message) {
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            field.parentElement.appendChild(feedback);
        }
    } else if (field.value && isValid) {
        field.classList.add('is-valid');
    }
}

// Validate all fields before submission
function validateAllFields() {
    const fields = ['from_account_id', 'to_account_number', 'amount'];
    let allValid = true;
    
    fields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            allValid = false;
        }
    });
    
    return allValid;
}

// Show confirmation modal before transfer
function showConfirmationModal() {
    const fromSelect = document.getElementById('from_account_id');
    const toAccountInput = document.getElementById('to_account_number');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    
    const fromAccount = fromSelect.options[fromSelect.selectedIndex].text;
    const toAccount = toAccountInput.value;
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value || 'No description provided';
    
    const modalHTML = `
        <div class="modal fade" id="confirmTransferModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>Confirm Transfer
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-4"><strong>From:</strong></div>
                                    <div class="col-8">${fromAccount}</div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-4"><strong>To:</strong></div>
                                    <div class="col-8">${toAccount}</div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-4"><strong>Amount:</strong></div>
                                    <div class="col-8"><span class="h5 text-primary">Rs ${amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-4"><strong>Description:</strong></div>
                                    <div class="col-8">${description}</div>
                                </div>
                            </div>
                        </div>
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            Please review the details carefully. This action cannot be undone.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="submitTransfer()">
                            <i class="fas fa-check me-2"></i>Confirm Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('confirmTransferModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('confirmTransferModal'));
    modal.show();
}

// Submit the transfer form
function submitTransfer() {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');
    const confirmButton = document.querySelector('[onclick="submitTransfer()"]');
    
    // Update button states
    confirmButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
    confirmButton.disabled = true;
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmTransferModal'));
    modal.hide();
    
    // Submit form
    form.submit();
}

// Add visual enhancements
function addVisualEnhancements() {
    // Animate transfer info cards
    const infoCards = document.querySelectorAll('.transfer-card, .card');
    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Add progress indicator for form completion
    addFormProgressIndicator();
}

// Form completion progress indicator
function addFormProgressIndicator() {
    const form = document.querySelector('form');
    if (!form) return;
    
    const progressHTML = `
        <div class="form-progress mb-4">
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
            </div>
            <small class="text-muted">Form completion: <span id="progress-text">0%</span></small>
        </div>
    `;
    
    const firstCard = document.querySelector('.card-body');
    if (firstCard) {
        firstCard.insertAdjacentHTML('afterbegin', progressHTML);
        
        // Update progress on field changes
        const requiredFields = form.querySelectorAll('[required]');
        const updateProgress = () => {
            let completed = 0;
            requiredFields.forEach(field => {
                if (field.value && !field.classList.contains('is-invalid')) {
                    completed++;
                }
            });
            
            const percentage = Math.round((completed / requiredFields.length) * 100);
            const progressBar = document.querySelector('.progress-bar');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar && progressText) {
                progressBar.style.width = percentage + '%';
                progressText.textContent = percentage + '%';
                
                // Change color based on completion
                progressBar.className = 'progress-bar ' + 
                    (percentage === 100 ? 'bg-success' : 
                     percentage >= 50 ? 'bg-warning' : 'bg-info');
            }
        };
        
        requiredFields.forEach(field => {
            field.addEventListener('input', updateProgress);
            field.addEventListener('change', updateProgress);
        });
    }
}
