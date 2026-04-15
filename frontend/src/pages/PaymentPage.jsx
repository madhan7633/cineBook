import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import './PaymentPage.css';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      navigate('/');
      return;
    }
    setBookingData(JSON.parse(data));
  }, []);

  const handlePayment = async () => {
    if (!bookingData) return;
    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create booking
      const res = await bookingsAPI.create({
        show_id: bookingData.show.id,
        seat_ids: bookingData.seats.map((s) => s.id),
      });

      setSuccess(true);
      sessionStorage.removeItem('bookingData');

      // Redirect to bookings after 3 seconds
      setTimeout(() => navigate('/bookings'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.seat_ids?.[0] || 'Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData) return null;

  if (success) {
    return (
      <div className="page">
        <div className="container">
          <div className="payment-success" id="payment-success">
            <div className="success-animation">
              <div className="success-circle">
                <span className="success-check">✓</span>
              </div>
            </div>
            <h1 className="success-title">Booking Confirmed! 🎉</h1>
            <p className="success-subtitle">Your tickets have been booked successfully</p>
            <div className="success-details glass-card">
              <div className="success-row">
                <span>Movie</span>
                <strong>{bookingData.show.movie_title}</strong>
              </div>
              <div className="success-row">
                <span>Seats</span>
                <strong>{bookingData.seats.map((s) => s.seat_number).join(', ')}</strong>
              </div>
              <div className="success-row">
                <span>Amount Paid</span>
                <strong className="gradient-text">₹{bookingData.totalPrice.toFixed(2)}</strong>
              </div>
            </div>
            <p className="success-redirect">Redirecting to your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="payment-layout">
          {/* Order Summary */}
          <div className="order-summary glass-card" id="order-summary">
            <h2 className="payment-section-title">🎬 Order Summary</h2>
            <div className="order-movie">
              <h3>{bookingData.show.movie_title}</h3>
              <p className="order-show-info">
                {bookingData.show.screen?.theatre?.name} • Screen {bookingData.show.screen?.screen_number}
              </p>
              <p className="order-show-time">
                {new Date(bookingData.show.show_time).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })} •{' '}
                {new Date(bookingData.show.show_time).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', hour12: true
                })}
              </p>
            </div>

            <div className="order-seats">
              <span className="order-label">Seats ({bookingData.seats.length})</span>
              <div className="order-seat-list">
                {bookingData.seats.map((seat) => (
                  <div key={seat.id} className="order-seat-item">
                    <span className="seat-tag">{seat.seat_number}</span>
                    <span className="seat-type-label">{seat.seat_type}</span>
                    <span className="seat-price-label">
                      ₹{seat.seat_type === 'VIP'
                        ? parseFloat(bookingData.show.vip_price || bookingData.show.price).toFixed(2)
                        : parseFloat(bookingData.show.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-total">
              <span>Total Amount</span>
              <span className="total-amount">₹{bookingData.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods glass-card" id="payment-methods">
            <h2 className="payment-section-title">💳 Payment Method</h2>

            <div className="method-options">
              {[
                { id: 'upi', label: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
                { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
                { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
                { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Amazon Pay, Mobikwik' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`method-option ${paymentMethod === method.id ? 'active' : ''}`}
                  htmlFor={`method-${method.id}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    id={`method-${method.id}`}
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="method-icon">{method.icon}</span>
                  <div className="method-info">
                    <span className="method-label">{method.label}</span>
                    <span className="method-desc">{method.desc}</span>
                  </div>
                  <span className="method-check">{paymentMethod === method.id ? '●' : '○'}</span>
                </label>
              ))}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              className="btn btn-primary btn-lg pay-btn"
              onClick={handlePayment}
              disabled={processing}
              id="pay-btn"
            >
              {processing ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${bookingData.totalPrice.toFixed(2)}`
              )}
            </button>

            <p className="payment-secure">🔒 Your payment is secure and encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
