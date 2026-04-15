import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MovieDetailPage.css';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);

  useEffect(() => {
    fetchMovie();
    fetchShows();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const res = await moviesAPI.getById(id);
      setMovie(res.data);
    } catch (err) {
      console.error('Failed to fetch movie:', err);
    }
  };

  const fetchShows = async () => {
    try {
      const res = await moviesAPI.getShows({ movie_id: id });
      setShows(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch shows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShow = (showId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/seats/${showId}`);
  };

  // Group shows by theatre
  const groupedShows = shows.reduce((acc, show) => {
    const theatreName = show.screen?.theatre?.name || 'Unknown';
    const theatreLocation = show.screen?.theatre?.location || '';
    const key = `${theatreName}__${theatreLocation}`;
    if (!acc[key]) {
      acc[key] = { name: theatreName, location: theatreLocation, shows: [] };
    }
    acc[key].shows.push(show);
    return acc;
  }, {});

  // Get unique dates from shows
  const dates = [...new Set(shows.map(s => new Date(s.show_time).toDateString()))];

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner-container"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>Movie not found</h3>
        </div>
      </div>
    );
  }

  const posterUrl = movie.poster_url || `https://picsum.photos/seed/movie${movie.id}/400/600`;

  return (
    <div className="page">
      {/* Movie Hero */}
      <section className="movie-hero" id="movie-hero">
        <div className="movie-hero-bg" style={{
          backgroundImage: `url(${posterUrl})`
        }}></div>
        <div className="container movie-hero-content">
          <div className="movie-hero-poster">
            <img src={posterUrl} alt={movie.title} />
          </div>
          <div className="movie-hero-info">
            <h1 className="movie-hero-title">{movie.title}</h1>
            <div className="movie-hero-meta">
              <span className="badge badge-accent">{movie.genre}</span>
              <span className="badge badge-info">{movie.language}</span>
              <span className="movie-hero-duration">🕐 {movie.duration} min</span>
              {movie.rating > 0 && (
                <span className="movie-hero-rating">⭐ {movie.rating}/10</span>
              )}
            </div>
            <p className="movie-hero-desc">{movie.description}</p>
            {movie.release_date && (
              <p className="movie-release">
                📅 Released: {new Date(movie.release_date).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Trailer */}
      {movie.trailer_url && (
        <section className="container trailer-section" id="trailer-section">
          <h2 className="section-title">🎥 Trailer</h2>
          <div className="trailer-wrapper">
            <iframe
              src={movie.trailer_url}
              title={`${movie.title} Trailer`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </section>
      )}

      {/* Shows */}
      <section className="container shows-section" id="shows-section">
        <h2 className="section-title">🎟️ Book Tickets</h2>

        {/* Date Selector */}
        {dates.length > 0 && (
          <div className="date-selector">
            {dates.map((date, i) => (
              <button
                key={date}
                className={`date-btn ${selectedDate === i ? 'active' : ''}`}
                onClick={() => setSelectedDate(i)}
              >
                <span className="date-day">{formatDate(date)}</span>
                <span className="date-full">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </button>
            ))}
          </div>
        )}

        {/* Theatre List */}
        {Object.keys(groupedShows).length > 0 ? (
          <div className="theatre-list">
            {Object.values(groupedShows).map((theatre) => {
              const filteredShows = theatre.shows.filter(
                (show) => new Date(show.show_time).toDateString() === dates[selectedDate]
              );

              if (filteredShows.length === 0) return null;

              return (
                <div key={theatre.name} className="theatre-card glass-card">
                  <div className="theatre-info">
                    <h3 className="theatre-name">{theatre.name}</h3>
                    <p className="theatre-location">📍 {theatre.location}</p>
                  </div>
                  <div className="show-times">
                    {filteredShows.map((show) => (
                      <button
                        key={show.id}
                        className="show-time-btn"
                        onClick={() => handleSelectShow(show.id)}
                        id={`show-${show.id}`}
                      >
                        <span className="show-time">{formatTime(show.show_time)}</span>
                        <span className="show-price">₹{show.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No shows available</h3>
            <p>Check back later for show timings</p>
          </div>
        )}
      </section>
    </div>
  );
}
