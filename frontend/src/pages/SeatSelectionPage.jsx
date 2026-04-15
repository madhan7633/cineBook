import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import './SeatSelectionPage.css';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [showData, setShowData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [showId]);

  const fetchSeats = async () => {
    try {
      const res = await moviesAPI.getSeats(showId);
      setShowData(res.data.show);
      setSeats(res.data.seats);
    } catch (err) {
      console.error('Failed to fetch seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      if (prev.length >= 10) return prev; // Max 10 seats
      return [...prev, seat];
    });
  };

  const calculateTotal = () => {
    if (!showData) return 0;
    return selectedSeats.reduce((sum, seat) => {
      const price = seat.seat_type === 'VIP'
        ? parseFloat(showData.vip_price || showData.price)
        : parseFloat(showData.price);
      return sum + price;
    }, 0);
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    // Store selection in sessionStorage for payment page
    sessionStorage.setItem('bookingData', JSON.stringify({
      show: showData,
      seats: selectedSeats,
      totalPrice: calculateTotal(),
    }));
    navigate('/payment');
  };

  // Group seats by row for grid layout
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.row_name;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

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
        {/* Show Info Header */}
        {showData && (
          <div className="seat-header glass-card" id="seat-header">
            <div>
              <h1 className="seat-movie-title">{showData.movie_title}</h1>
              <p className="seat-show-info">
                {showData.screen?.theatre?.name} • Screen {showData.screen?.screen_number} •{' '}
                {new Date(showData.show_time).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short'
                })} •{' '}
                {new Date(showData.show_time).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', hour12: true
                })}
              </p>
            </div>
            <div className="seat-price-info">
              <span className="price-tag">Normal: ₹{showData.price}</span>
              {showData.vip_price > 0 && (
                <span className="price-tag vip">VIP: ₹{showData.vip_price}</span>
              )}
            </div>
          </div>
        )}

        {/* Screen Indicator */}
        <div className="screen-container">
          <div className="screen-curve"></div>
          <span className="screen-label">SCREEN</span>
        </div>

        {/* Seat Grid */}
        <div className="seat-grid" id="seat-grid">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              <div className="row-seats">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.find((s) => s.id === seat.id);
                  let seatClass = 'seat';
                  if (seat.is_booked) seatClass += ' booked';
                  else if (isSelected) seatClass += ' selected';
                  if (seat.seat_type === 'VIP') seatClass += ' vip';

                  return (
                    <button
                      key={seat.id}
                      className={seatClass}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.is_booked}
                      title={`${seat.seat_number} - ${seat.seat_type}${seat.is_booked ? ' (Booked)' : ''}`}
                      id={`seat-${seat.id}`}
                    >
                      {seat.seat_number.replace(row, '')}
                    </button>
                  );
                })}
              </div>
              <span className="row-label">{row}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <span className="legend-box available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-box selected"></span>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <span className="legend-box booked"></span>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <span className="legend-box vip-legend"></span>
            <span>VIP</span>
          </div>
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="booking-summary glass-card" id="booking-summary">
            <div className="summary-details">
              <div className="summary-seats">
                <span className="summary-label">Selected Seats</span>
                <div className="summary-seat-tags">
                  {selectedSeats.map((s) => (
                    <span key={s.id} className="seat-tag">{s.seat_number}</span>
                  ))}
                </div>
              </div>
              <div className="summary-total">
                <span className="summary-label">Total</span>
                <span className="summary-price">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-lg proceed-btn"
              onClick={handleProceed}
              id="proceed-btn"
            >
              Proceed to Pay — ₹{calculateTotal().toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
