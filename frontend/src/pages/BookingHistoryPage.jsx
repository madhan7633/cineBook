import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import './BookingHistoryPage.css';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getHistory();
      setBookings(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
    };
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner-container"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">🎟️ My Bookings</h1>

        {bookings.length > 0 ? (
          <div className="bookings-list" id="bookings-list">
            {bookings.map((booking, index) => {
              const showDt = formatDateTime(booking.show_time);
              const bookDt = formatDateTime(booking.booking_time);

              return (
                <div
                  key={booking.id}
                  className="booking-card glass-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  id={`booking-${booking.id}`}
                >
                  <div className="booking-card-header">
                    <div className="booking-movie-info">
                      <h3 className="booking-movie-title">{booking.movie_title}</h3>
                      <p className="booking-theatre">
                        {booking.theatre_name} • Screen {booking.screen_number}
                      </p>
                    </div>
                    <span className={`badge ${booking.status === 'BOOKED' ? 'badge-success' : 'badge-danger'}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="booking-card-body">
                    <div className="booking-detail">
                      <span className="booking-detail-label">📅 Show</span>
                      <span>{showDt.date} • {showDt.time}</span>
                    </div>
                    <div className="booking-detail">
                      <span className="booking-detail-label">💺 Seats</span>
                      <div className="booking-seats-tags">
                        {booking.seats?.map((s) => (
                          <span key={s.id} className="seat-tag">{s.seat_number}</span>
                        ))}
                      </div>
                    </div>
                    <div className="booking-detail">
                      <span className="booking-detail-label">💰 Amount</span>
                      <span className="booking-amount">₹{parseFloat(booking.total_price).toFixed(2)}</span>
                    </div>
                    <div className="booking-detail">
                      <span className="booking-detail-label">🕐 Booked</span>
                      <span className="booking-time-stamp">{bookDt.date} • {bookDt.time}</span>
                    </div>
                  </div>

                  {booking.status === 'BOOKED' && (
                    <div className="booking-card-footer">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(booking.id)}
                        id={`cancel-${booking.id}`}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <h3>No bookings yet</h3>
            <p>Start by booking tickets for your favorite movie!</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
