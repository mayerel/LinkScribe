# Payment Integration Guide

This guide explains how to integrate payment solutions into the Hot or Not application. Currently, the app uses a demo mode for payments, but here's how to implement real payment processing.

## Overview

The app currently supports three major payment providers:
- Stripe
- PayPal
- Google Pay

## Implementation Steps

### 1. Stripe Integration

```javascript
// Add Stripe.js to your HTML
<script src="https://js.stripe.com/v3/"></script>

// Initialize Stripe
const stripe = Stripe('your_publishable_key');

// Create payment intent (requires backend)
async function createPaymentIntent() {
    const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 999 }) // $9.99
    });
    return response.json();
}

// Handle payment
async function handleStripePayment() {
    const { clientSecret } = await createPaymentIntent();
    const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: elements.getElement('card'),
            billing_details: {
                name: state.profile.name
            }
        }
    });
    
    if (result.error) {
        showNotification('Payment failed: ' + result.error.message);
    } else {
        state.isPremium = true;
        saveState();
        showPremiumResults();
    }
}
```

### 2. PayPal Integration

```javascript
// Add PayPal SDK to your HTML
<script src="https://www.paypal.com/sdk/js?client-id=your_client_id"></script>

// Initialize PayPal buttons
paypal.Buttons({
    createOrder: function() {
        return fetch('/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: '9.99',
                currency: 'USD'
            })
        })
        .then(res => res.json())
        .then(order => order.id);
    },
    onApprove: function(data) {
        return fetch('/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: data.orderID
            })
        })
        .then(res => res.json())
        .then(details => {
            state.isPremium = true;
            saveState();
            showPremiumResults();
        });
    }
}).render('#paypal-button-container');
```

### 3. Google Pay Integration

```javascript
// Add Google Pay API
<script async src="https://pay.google.com/gp/p/js/pay.js"></script>

// Initialize Google Pay
const client = new google.payments.api.PaymentsClient({
    environment: 'TEST' // Change to 'PRODUCTION' for live
});

// Create payment request
const paymentRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD']
        }
    }],
    merchantInfo: {
        merchantId: 'your_merchant_id',
        merchantName: 'Hot or Not'
    },
    transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: '9.99',
        currencyCode: 'USD',
        countryCode: 'US'
    }
};

// Handle payment
async function handleGooglePay() {
    const paymentData = await client.loadPaymentData(paymentRequest);
    // Process payment data with your backend
    const response = await fetch('/process-google-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });
    
    if (response.ok) {
        state.isPremium = true;
        saveState();
        showPremiumResults();
    }
}
```

## Backend Requirements

For secure payment processing, you'll need a backend server that can:

1. Create payment intents/orders
2. Handle webhooks for payment status updates
3. Securely store API keys and secrets
4. Process and validate payment tokens
5. Update user premium status

## Security Considerations

- Never store payment credentials on the client side
- Always use HTTPS for payment processing
- Implement proper error handling and logging
- Follow PCI compliance guidelines
- Use environment variables for API keys
- Implement proper authentication before payment processing

## Vibe Coding Tools & Third-Party Integration Tips

When implementing payment solutions, consider leveraging these modern development approaches:

### Third-Party Integration Best Practices
- Use established payment SDKs and libraries instead of building from scratch
- Consider using payment aggregators like Stripe Connect or PayPal Payouts for marketplace scenarios
- Implement webhook listeners for real-time payment status updates
- Use payment provider's official SDKs for better security and reliability

### Vibe Coding Tools & Frameworks
- **Stripe Elements**: Pre-built UI components for a consistent payment experience
- **PayPal Smart Payment Buttons**: Dynamic buttons that show the most relevant payment methods
- **Google Pay API**: Native integration for Android and web platforms
- **Payment Request API**: Modern browser API for streamlined checkout experiences
- **React-Payment-Inputs**: React components for building custom payment forms
- **Vue-Stripe-Elements**: Vue.js integration for Stripe Elements

### Lightweight Implementation Approaches

#### Stripe Checkout (Simplest Approach)
```javascript
// Minimal implementation using Stripe Checkout
const stripe = Stripe('pk_test_your_key');

// Single line to create checkout session
const { error } = await stripe.redirectToCheckout({
  lineItems: [{ price: 'price_H5ggYwtDq4fbrJ', quantity: 1 }],
  mode: 'payment',
  successUrl: 'https://your-domain.com/success',
  cancelUrl: 'https://your-domain.com/cancel'
});
```

#### PayPal Express Checkout
```javascript
// Minimal PayPal implementation
paypal.Buttons({
  createOrder: (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '9.99'
        }
      }]
    });
  },
  onApprove: (data, actions) => {
    return actions.order.capture().then(details => {
      // Handle successful payment
    });
  }
}).render('#paypal-button');
```

#### Google Pay Quick Integration
```javascript
// Minimal Google Pay setup
const client = new google.payments.api.PaymentsClient({
  environment: 'TEST'
});

const button = client.createButton({
  onClick: () => {
    // Handle payment
  },
  allowedPaymentMethods: ['CARD'],
  buttonType: 'buy',
  buttonColor: 'black'
});

document.getElementById('container').appendChild(button);
```

### Implementation Tips for Minimal Code
1. **Use Hosted Solutions**
   - Leverage payment provider's hosted checkout pages
   - Utilize pre-built UI components
   - Implement redirect-based flows instead of embedded forms

2. **Backend Simplification**
   - Use serverless functions for payment processing
   - Implement webhook-based status updates
   - Store minimal payment data

3. **Code Organization**
   - Create reusable payment service modules
   - Use environment variables for configuration
   - Implement payment provider factory pattern

4. **Error Handling**
   - Use try-catch blocks for payment operations
   - Implement retry mechanisms for failed requests
   - Log payment errors for debugging

5. **Testing Strategy**
   - Use payment provider's test mode
   - Implement mock payment services for development
   - Create automated tests for payment flows

## Testing

Each payment provider offers sandbox/test environments:

- Stripe: Use test API keys and test card numbers
- PayPal: Use sandbox accounts and test cards
- Google Pay: Use test environment and test cards

## Error Handling

Implement proper error handling for common scenarios:

```javascript
function handlePaymentError(error) {
    let message = 'Payment failed. ';
    
    switch(error.type) {
        case 'card_error':
            message += error.message;
            break;
        case 'validation_error':
            message += 'Please check your payment details.';
            break;
        case 'api_error':
            message += 'Please try again later.';
            break;
        default:
            message += 'An unexpected error occurred.';
    }
    
    showNotification(message);
}
```

## Offsite Payment Processing Approaches

### Benefits of Offsite Processing
- Reduced PCI compliance scope
- Minimal code maintenance
- Enhanced security
- Simplified user experience
- Lower development costs

### Implementation Methods

#### 1. Stripe Checkout Pages
```javascript
// Redirect to Stripe's hosted checkout
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_H5ggYwtDq4fbrJ',
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://your-domain.com/success',
  cancel_url: 'https://your-domain.com/cancel',
});

// Redirect to Stripe's hosted page
window.location.href = session.url;
```

#### 2. PayPal Smart Payment Buttons
```javascript
// Let PayPal handle the entire payment flow
paypal.Buttons({
  style: {
    layout: 'vertical',
    color: 'blue',
    shape: 'rect',
    label: 'pay'
  },
  createOrder: (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: '9.99'
        }
      }]
    });
  },
  onApprove: (data, actions) => {
    // Handle success
  }
}).render('#paypal-container');
```

#### 3. Payment Links
```javascript
// Create a payment link (Stripe example)
const paymentLink = await stripe.paymentLinks.create({
  line_items: [{
    price: 'price_H5ggYwtDq4fbrJ',
    quantity: 1,
  }],
});

// Share the payment link with customers
const url = paymentLink.url;
```

### Best Practices for Offsite Processing

1. **URL Management**
   - Use dynamic success/cancel URLs
   - Implement proper URL validation
   - Handle deep linking scenarios

2. **State Management**
   - Pass order references in URLs
   - Use session tokens for verification
   - Implement proper state recovery

3. **User Experience**
   - Provide clear loading states
   - Implement proper error handling
   - Add progress indicators

4. **Security Considerations**
   - Validate return URLs
   - Implement proper session management
   - Use secure communication channels

5. **Integration Tips**
   - Use webhooks for status updates
   - Implement proper error recovery
   - Handle timeout scenarios

### Example Webhook Handler
```javascript
// Handle payment status updates
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    'your_webhook_secret'
  );

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update order status
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

### Implementation Checklist
- [ ] Set up webhook endpoints
- [ ] Configure success/cancel URLs
- [ ] Implement proper error handling
- [ ] Set up payment status tracking
- [ ] Configure email notifications
- [ ] Implement proper logging
- [ ] Set up monitoring and alerts

## Next Steps

1. Set up a backend server
2. Create necessary API endpoints
3. Implement proper error handling
4. Add payment status tracking
5. Implement webhook handlers
6. Add payment history
7. Implement refund handling

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Portal](https://developer.paypal.com)
- [Google Pay API Documentation](https://developers.google.com/pay/api)
- [PCI Compliance Guidelines](https://www.pcisecuritystandards.org) 