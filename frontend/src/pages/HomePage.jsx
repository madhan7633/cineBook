import { useState, useEffect } from 'react';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import './HomePage.css';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance'];

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    fetchMovies();
  }, [search, selectedGenre]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      const res = await moviesAPI.getAll(params);
      setMovies(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <h1 className="hero-title">
            Book Your <span className="gradient-text">Movie Experience</span>
          </h1>
          <p className="hero-subtitle">
            Discover the latest blockbusters and book your seats in seconds
          </p>
          <div className="hero-search" id="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              id="search-input"
            />
          </div>
        </div>
      </section>

      {/* Genre Filter */}
      <section className="container">
        <div className="genre-filter" id="genre-filter">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
              id={`genre-${genre.toLowerCase()}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Movies Grid */}
      <section className="container">
        <h2 className="section-title">
          {selectedGenre === 'All' ? '🎬 Now Showing' : `🎬 ${selectedGenre} Movies`}
        </h2>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : movies.length > 0 ? (
          <div className="movies-grid" id="movies-grid">
            {movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3>No movies found</h3>
            <p>Try a different search or genre filter</p>
          </div>
        )}
      </section>
    </div>
  );
}
