document.addEventListener('DOMContentLoaded', function() {
    const fromSelect = document.getElementById('from_account_id');
    if (fromSelect) {
        fromSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const balance = selectedOption.getAttribute('data-balance');
            document.getElementById('available-balance').textContent = 'Rs ' + parseFloat(balance).toFixed(2);
        });
    }

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const fromAccount = document.getElementById('from_account_id').value;
            const toAccount = document.getElementById('to_account_number').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const selectedOption = document.getElementById('from_account_id').options[document.getElementById('from_account_id').selectedIndex];
            const balance = parseFloat(selectedOption.getAttribute('data-balance'));

            if (fromAccount === toAccount) {
                e.preventDefault();
                alert('Cannot transfer to the same account!');
                return;
            }

            if (amount > balance) {
                e.preventDefault();
                alert('Insufficient balance!');
                return;
            }

            if (amount > 10000) {
                e.preventDefault();
                alert('Amount exceeds daily limit of Rs 10,000!');
                return;
            }
        });
    }
});
