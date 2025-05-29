// payment.js: Handles payment UI and logic

export function showPaymentSidebar(onPaymentSuccess, onCancel) {
    // Create sidebar overlay
    let overlay = document.createElement('div');
    overlay.id = 'payment-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.right = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.3)';
    overlay.style.zIndex = 10000;
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'flex-end';
    overlay.style.alignItems = 'stretch';

    // Create sidebar
    let sidebar = document.createElement('div');
    sidebar.id = 'payment-sidebar';
    sidebar.style.width = '400px';
    sidebar.style.height = '100%';
    sidebar.style.background = '#fff';
    sidebar.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.1)';
    sidebar.style.padding = '32px 24px';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.justifyContent = 'center';

    // Payment form content
    sidebar.innerHTML = `
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem;">Complete Your Payment</h2>
        <form id="payment-form">
            <label style="font-weight: 500; margin-bottom: 0.5rem; display: block;">Card Number</label>
            <input type="text" id="card-number" maxlength="19" placeholder="1234 5678 9012 3456" required style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
            <label style="font-weight: 500; margin-bottom: 0.5rem; display: block;">Expiry</label>
            <input type="text" id="card-expiry" maxlength="5" placeholder="MM/YY" required style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
            <label style="font-weight: 500; margin-bottom: 0.5rem; display: block;">CVC</label>
            <input type="text" id="card-cvc" maxlength="4" placeholder="CVC" required style="width: 100%; padding: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
            <button type="submit" style="width: 100%; background: #2563eb; color: #fff; font-weight: 600; padding: 0.75rem; border-radius: 0.5rem; border: none; font-size: 1rem; margin-bottom: 1rem; cursor: pointer;">Pay $5</button>
            <button type="button" id="cancel-payment" style="width: 100%; background: #e5e7eb; color: #111; font-weight: 500; padding: 0.75rem; border-radius: 0.5rem; border: none; font-size: 1rem; cursor: pointer;">Cancel</button>
        </form>
    `;

    overlay.appendChild(sidebar);
    document.body.appendChild(overlay);

    // Focus first input
    sidebar.querySelector('#card-number').focus();

    // Handle form submit (simulate payment)
    sidebar.querySelector('#payment-form').onsubmit = function(e) {
        e.preventDefault();
        // Simulate payment delay
        sidebar.querySelector('button[type="submit"]').innerText = 'Processing...';
        setTimeout(() => {
            document.body.removeChild(overlay);
            onPaymentSuccess();
        }, 1200);
    };

    // Handle cancel
    sidebar.querySelector('#cancel-payment').onclick = function() {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };
}
