import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import RazorpayCheckout from '../components/RazorpayCheckout';

const PaymentDemo = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [amount, setAmount] = useState(50000);

  const handlePaymentSuccess = (response) => {
    setPaymentStatus({
      type: 'success',
      message: 'Payment successful!',
      details: response,
    });
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setPaymentStatus({
      type: 'error',
      message: error.message || 'Payment failed',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-4">
            Razorpay Payment Demo
          </h1>
          <p className="text-gray-300 mb-8">
            Test the Razorpay integration with a sample payment
          </p>

          <div className="mb-6">
            <label className="block text-white mb-2">
              Amount (in paise, min 100):
            </label>
            <input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 100)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-sm mt-1">
              ₹{(amount / 100).toFixed(2)}
            </p>
          </div>

          <div className="mb-6">
            <RazorpayCheckout
              amount={amount}
              currency="INR"
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
          </div>

          {paymentStatus && (
            <div
              className={`p-4 rounded-lg ${
                paymentStatus.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-red-500/20 border border-red-500/50'
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  paymentStatus.type === 'success'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {paymentStatus.type === 'success' ? <><CheckCircle size={16} className="inline mr-1.5" />Success</> : <><XCircle size={16} className="inline mr-1.5" />Error</>}
              </h3>
              <p className="text-white mb-2">{paymentStatus.message}</p>
              {paymentStatus.details && (
                <div className="mt-2 text-sm text-gray-300">
                  <p>Payment ID: {paymentStatus.details.payment_id}</p>
                  <p>Order ID: {paymentStatus.details.order_id}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Test Cards:</h3>
            <div className="text-gray-300 text-sm space-y-1">
              <p>Card: 4111 1111 1111 1111</p>
              <p>CVV: Any 3 digits</p>
              <p>Expiry: Any future date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;
