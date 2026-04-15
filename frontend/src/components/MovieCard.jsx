import { Link } from 'react-router-dom';
import './MovieCard.css';

export default function MovieCard({ movie, index }) {
  const posterUrl = movie.poster_url || `https://picsum.photos/seed/movie${movie.id}/400/600`;

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="movie-card"
      id={`movie-card-${movie.id}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="movie-poster-wrapper">
        <img
          src={posterUrl}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/movie${movie.id}/400/600`;
          }}
        />
        <div className="movie-overlay">
          <span className="movie-book-btn">Book Now</span>
        </div>
        {movie.rating > 0 && (
          <div className="movie-rating">
            <span>⭐</span>
            <span>{movie.rating}</span>
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="badge badge-accent">{movie.genre}</span>
          <span className="movie-duration">{movie.duration} min</span>
        </div>
        <span className="movie-lang">{movie.language}</span>
      </div>
    </Link>
  );
}
