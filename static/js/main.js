// Enhanced Banking System UI - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations and enhancements
    initializeAnimations();
    initializeFormEnhancements();
    initializeCardAnimations();
    initializeNotifications();
    initializeResponsiveEnhancements();
    
    // Add loading states for better UX
    addLoadingStates();
});

// Animation initializations
function initializeAnimations() {
    // Fade in elements on page load
    const elements = document.querySelectorAll('.card, .alert, .btn');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Enhanced form interactions
function initializeFormEnhancements() {
    const inputs = document.querySelectorAll('.form-control, .form-select');
    
    inputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation feedback
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

// Input validation with visual feedback
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const isValid = checkInputValidity(input, value, type);
    
    // Remove existing feedback
    input.classList.remove('is-valid', 'is-invalid');
    
    if (value && isValid) {
        input.classList.add('is-valid');
    } else if (value && !isValid) {
        input.classList.add('is-invalid');
    }
}

// Input validation logic
function checkInputValidity(input, value, type) {
    switch (type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'number':
            const num = parseFloat(value);
            const min = parseFloat(input.min) || 0;
            const max = parseFloat(input.max) || Infinity;
            return !isNaN(num) && num >= min && num <= max;
        case 'text':
            if (input.name === 'username') {
                return value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
            }
            return value.length >= 2;
        case 'password':
            return value.length >= 6;
        default:
            return true;
    }
}

// Enhanced card interactions
function initializeCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Account card special effects
    const accountCards = document.querySelectorAll('.account-card');
    accountCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                addRippleEffect(this, e);
            }
        });
    });
}

// Ripple effect for cards
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Enhanced notifications
function initializeNotifications() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.style.opacity = '0';
                alert.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (alert.parentElement) {
                        alert.remove();
                    }
                }, 300);
            }
        }, 5000);
    });
}

// Loading states for forms
function addLoadingStates() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
                submitButton.disabled = true;
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }, 5000);
            }
        });
    });
}

// Responsive enhancements
function initializeResponsiveEnhancements() {
    // Smooth scroll for mobile navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile sidebar on navigation
            const mobileSidebar = document.getElementById('mobileSidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            if (mobileSidebar && mobileSidebar.classList.contains('show')) {
                mobileSidebar.classList.remove('show');
                overlay.classList.remove('show');
            }
        });
    });
}

// Utility functions
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'danger');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.col-md-9.col-lg-10 .p-4') || document.body;
    const firstChild = mainContent.firstElementChild;
    mainContent.insertBefore(alertDiv, firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// Add CSS for ripple effect
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);
