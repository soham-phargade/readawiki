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
      // Wikipedia API endpoint – note the `origin=*` parameter to bypass CORS restrictions.
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&format=json&srsearch=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.query.search);
    } catch (err) {
      setError('Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Rose Pine Search</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search Wikipedia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </header>
      <main className="results">
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {results.map((result) => (
          <div key={result.pageid} className="result-item">
            <h2 className="result-title">{result.title}</h2>
            {/* Wikipedia API returns HTML snippets; use caution with dangerouslySetInnerHTML */}
            <p
              className="result-snippet"
              dangerouslySetInnerHTML={{ __html: result.snippet + '...' }}
            />
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
