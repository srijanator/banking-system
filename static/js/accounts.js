function showDepositModal(accountId) {
    document.getElementById('account_id').value = accountId;
    new bootstrap.Modal(document.getElementById('depositModal')).show();
}

function showWithdrawModal(accountId) {
    document.getElementById('withdraw_account_id').value = accountId;
    const withdrawSelect = document.getElementById('withdraw_account_id');
    const selectedOption = withdrawSelect.options[withdrawSelect.selectedIndex];
    if (selectedOption && selectedOption.getAttribute('data-balance')) {
        const balance = selectedOption.getAttribute('data-balance');
        document.getElementById('withdraw-balance').textContent = 'Rs ' + parseFloat(balance).toFixed(2);
    }
    new bootstrap.Modal(document.getElementById('withdrawModal')).show();
}

// Update balance display when account is selected in withdrawal modal
document.addEventListener('DOMContentLoaded', function() {
    const withdrawSelect = document.getElementById('withdraw_account_id');
    if (withdrawSelect) {
        withdrawSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption && selectedOption.getAttribute('data-balance')) {
                const balance = selectedOption.getAttribute('data-balance');
                document.getElementById('withdraw-balance').textContent = 'Rs ' + parseFloat(balance).toFixed(2);
            }
        });
    }
});

function showAccountDetails(accountId, accountNumber, accountType, balance, interest, branchName, status, createdDate) {
    document.getElementById('detail-account-number').textContent = accountNumber;
    document.getElementById('detail-account-type').textContent = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    document.getElementById('detail-status').innerHTML = `<span class="badge bg-${status === 'active' ? 'success' : 'secondary'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    document.getElementById('detail-interest').textContent = interest + '%';
    document.getElementById('detail-created').textContent = new Date(createdDate).toLocaleDateString();

    document.getElementById('detail-balance').textContent = 'Rs ' + parseFloat(balance).toFixed(2);
    document.getElementById('detail-branch').textContent = branchName;
    document.getElementById('detail-account-id').textContent = accountId;

    document.getElementById('summary-balance').textContent = 'Rs ' + parseFloat(balance).toFixed(2);
    document.getElementById('summary-interest').textContent = interest + '%';
    document.getElementById('summary-status').textContent = status.charAt(0).toUpperCase() + status.slice(1);

    const features = {
        'savings': { 'online-banking': true, 'mobile-app': true, 'debit-card': true, 'checks': false },
        'current': { 'online-banking': true, 'mobile-app': true, 'debit-card': true, 'checks': true }
    };
    const accountFeatures = features[accountType] || features['savings'];
    document.getElementById('feature-online-banking').style.display = accountFeatures['online-banking'] ? 'block' : 'none';
    document.getElementById('feature-mobile-app').style.display = accountFeatures['mobile-app'] ? 'block' : 'none';
    document.getElementById('feature-debit-card').style.display = accountFeatures['debit-card'] ? 'block' : 'none';
    document.getElementById('feature-checks').style.display = accountFeatures['checks'] ? 'block' : 'none';

    new bootstrap.Modal(document.getElementById('accountDetailsModal')).show();
}

function printAccountDetails() {
    const printContent = document.getElementById('accountDetailsModal').innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #333;">Account Details</h2>
            <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
                ${printContent}
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
                Generated on ${new Date().toLocaleString()}
            </div>
        </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
}
