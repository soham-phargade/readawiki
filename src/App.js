import React, { useState } from 'react';
import './App.css';

function App() {
  // Local state for the search query, results, loading, and error states.
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handles the search form submission.
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Use generator=search with extracts to return a longer excerpt (~10 sentences)
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(
          query
        )}&prop=extracts&exintro=1&exsentences=10&explaintext=1&format=json`
      );
      const data = await response.json();

      if (data.query && data.query.pages) {
        const pages = Object.values(data.query.pages);
        // Sort pages by their "index" property to maintain the original search order
        pages.sort((a, b) => a.index - b.index);
        setResults(pages);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">ReadA.Wiki</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search Wikipedia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="search-icon"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </header>
      <main className="results">
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {results.map((result) => (
          <div key={result.pageid} className="result-item">
            <h2 className="result-title">
              <a
                href={`https://en.wikipedia.org/?curid=${result.pageid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.title}
              </a>
            </h2>
            <p className="result-snippet">{result.extract}</p>
            <a
              href={`https://en.wikipedia.org/?curid=${result.pageid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link"
            >
              Read more
            </a>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
