# Razorpay Integration Guide

This document explains the Razorpay Standard Checkout integration in the Vikku project.

## Overview

The integration consists of:
- **Backend**: Vercel serverless functions for order creation and payment verification
- **Frontend**: React component for Razorpay checkout modal
- **Demo Page**: Test page at `/payment-demo`

## Files Created/Modified

### Backend (Vercel Serverless Functions)
- `api/create-order.js` - Creates Razorpay orders
- `api/verify-payment.js` - Verifies payment signatures

### Frontend
- `src/components/RazorpayCheckout.jsx` - Reusable payment component
- `src/pages/PaymentDemo.jsx` - Demo page for testing
- `src/App.jsx` - Added route for demo page
- `index.html` - Added Razorpay checkout script

### Configuration
- `.env.example` - Updated with Razorpay credentials template
- `package.json` - Added razorpay dependency

## Environment Setup

1. **Update your `.env` file** with the provided credentials:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_T1zQ9RsQxf5E8Y
RAZORPAY_KEY_SECRET=fQyoXQRralFMVXYByaFsLGSW
```

⚠️ **IMPORTANT**: 
- `VITE_RAZORPAY_KEY_ID` is prefixed with `VITE_` so it's accessible in the frontend
- `RAZORPAY_KEY_SECRET` has NO prefix - it's only used in backend API routes
- Never commit the `.env` file (already in `.gitignore`)

## How It Works

### 1. Create Order (Backend)
- Endpoint: `POST /api/create-order`
- Request body: `{ amount: 50000, currency: "INR", receipt: "receipt_123" }`
- Returns: `{ order_id, amount, currency }`

### 2. Checkout (Frontend)
- User clicks "Pay" button
- Frontend calls `/api/create-order`
- Opens Razorpay modal with order details
- User completes payment

### 3. Verify Payment (Backend)
- On successful payment, frontend receives: `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
- Frontend sends these to `/api/verify-payment`
- Backend verifies signature using HMAC-SHA256
- Returns success/failure

## Usage

### Basic Usage

```jsx
import RazorpayCheckout from './components/RazorpayCheckout';

function MyComponent() {
  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    // Handle successful payment
  };

  const handleFailure = (error) => {
    console.error('Payment failed:', error);
    // Handle failed payment
  };

  return (
    <RazorpayCheckout
      amount={50000}  // Amount in paise (₹500.00)
      currency="INR"
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    />
  );
}
```

### Component Props

- `amount` (required): Amount in paise (100 paise = ₹1)
- `currency` (optional): Currency code, default "INR"
- `onSuccess` (optional): Callback on successful payment
- `onFailure` (optional): Callback on failed/cancelled payment

## Testing

### Local Development

1. **Start the dev server**:
```bash
npm run dev
```

2. **Visit the demo page**:
```
http://localhost:5173/payment-demo
```

3. **Use test card details**:
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Deployment (Vercel)

1. **Deploy to Vercel**:
```bash
vercel
```

2. **Add environment variables** in Vercel dashboard:
   - `VITE_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

3. **Test on production URL**

## API Endpoints

### POST /api/create-order

Creates a new Razorpay order.

**Request:**
```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response (Success):**
```json
{
  "order_id": "order_xxxxxxxxxxxxx",
  "amount": 50000,
  "currency": "INR"
}
```

**Response (Error):**
```json
{
  "error": "Invalid amount. Minimum amount is 100 paise (₹1)"
}
```

### POST /api/verify-payment

Verifies payment signature.

**Request:**
```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "xxxxxxxxxxxxx"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "pay_xxxxxxxxxxxxx",
  "order_id": "order_xxxxxxxxxxxxx"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid signature. Payment verification failed."
}
```

## Error Handling

The integration handles:
- Invalid amounts (< 100 paise)
- Razorpay API failures
- Authentication errors
- Signature verification failures
- User cancellation
- Payment failures

## Security Notes

- ✅ Key secret is never exposed to frontend
- ✅ All payments are verified server-side
- ✅ HMAC-SHA256 signature verification
- ✅ Environment variables for credentials
- ✅ `.env` file in `.gitignore`

## Next Steps

To integrate payments into your actual pages:

1. Import the component:
```jsx
import RazorpayCheckout from '../components/RazorpayCheckout';
```

2. Add it to your page with appropriate amount and callbacks

3. Handle success/failure in your application logic (e.g., update database, send confirmation email, etc.)

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Test Mode: Currently using test credentials
- Production: Replace with live credentials when ready
