import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * HistorySidebar Component
 *
 * Displays the search history as a one‑level tree. Each query node shows the search query,
 * and its only children (leaf nodes) are the Wikipedia articles the user clicked.
 *
 * The header now displays a label ("Search History") and a history icon (a clock with a counter‑clockwise arrow).
 * Clicking anywhere on the header toggles the collapse/expand state.
 */
function HistorySidebar({
  history,
  expandedNodes,
  onToggle,
  onQueryClick,
  onDelete,
  activeQueryId,
  isOpen,
  onToggleSidebar,
}) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header" onClick={onToggleSidebar}>
        {isOpen ? (
          <>
            <h2 className="sidebar-title">Search History</h2>
            <span className="sidebar-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="12 8 12 12 14 14"></polyline>
                <path d="M21 12a9 9 0 1 1-3.5-7.5"></path>
              </svg>
            </span>
          </>
        ) : (
          <span className="sidebar-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="12 8 12 12 14 14"></polyline>
              <path d="M21 12a9 9 0 1 1-3.5-7.5"></path>
            </svg>
          </span>
        )}
      </div>
      {isOpen && (
        <ul className="history-tree">
          {history.map((queryItem) => {
            // By default, a query's articles list is expanded if no value is set.
            const isExpanded =
              expandedNodes[queryItem.id] === undefined
                ? true
                : expandedNodes[queryItem.id];
            return (
              <li
                key={queryItem.id}
                className={`tree-node ${
                  activeQueryId === queryItem.id ? 'active' : ''
                }`}
              >
                <div
                  className="node-content"
                  onClick={() => onQueryClick(queryItem)}
                >
                  {queryItem.articles.length > 0 && (
                    <span
                      className="toggle-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(
                          queryItem.id,
                          expandedNodes[queryItem.id] === undefined
                            ? false
                            : !expandedNodes[queryItem.id]
                        );
                      }}
                      style={{
                        transform: isExpanded
                          ? 'rotate(90deg)'
                          : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      ▶
                    </span>
                  )}
                  <span className="node-label">{queryItem.query}</span>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(queryItem.id, 'query');
                    }}
                  >
                    🚮 
                  </button>
                </div>
                {queryItem.articles && queryItem.articles.length > 0 && (
                  <ul
                    className="tree-children"
                    style={{
                      maxHeight: isExpanded ? '500px' : '0',
                      transition: 'max-height 0.5s ease',
                      overflow: 'hidden',
                    }}
                  >
                    {queryItem.articles.map((article) => (
                      <li key={article.id} className="child-node">
                        <div
                          className="node-content"
                          onClick={() => onQueryClick(article)}
                        >
                          <span className="node-label">{article.title}</span>
                          <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(article.id, 'link', queryItem.id);
                            }}
                          >
                            🚮 
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * App Component
 *
 * – When the user submits a search, a new query node is created and added at the top of the history.
 * – The active query (the most recent search) is used for adding clicked Wikipedia articles as leaf nodes.
 * – Clicking a query in the sidebar re-runs that search.
 */
function App() {
  // History is an array of query objects: { id, query, articles: [ { id, title, url } ] }
  const [history, setHistory] = useState([]);
  // activeQueryId is the id of the currently active search query.
  const [activeQueryId, setActiveQueryId] = useState(null);
  // Search input and results state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Sidebar open/collapsed state and node expansion state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});

  // Load saved history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  // Execute a Wikipedia search query.
  const doSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(
          searchQuery
        )}&prop=extracts&exintro=1&exsentences=10&explaintext=1&format=json`
      );
      const data = await response.json();
      if (data.query && data.query.pages) {
        const pages = Object.values(data.query.pages);
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

  // When the user submits a search, create a new query node.
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    await doSearch(query);
    const newQueryNode = {
      id: Date.now().toString(),
      query: query,
      articles: [],
    };
    setHistory((prev) => [newQueryNode, ...prev]);
    setActiveQueryId(newQueryNode.id);
  };

  // When a Wikipedia result is clicked, add it as a leaf under the active query and open it.
  const handleResultClick = (result) => {
    if (!activeQueryId) return;
    const newArticle = {
      id: Date.now().toString(),
      title: result.title,
      url: `https://en.wikipedia.org/?curid=${result.pageid}`,
    };
    setHistory((prev) =>
      prev.map((q) => {
        if (q.id === activeQueryId) {
          if (!q.articles.find((a) => a.url === newArticle.url)) {
            return { ...q, articles: [...q.articles, newArticle] };
          }
        }
        return q;
      })
    );
    window.open(newArticle.url, '_blank');
  };

  // When a query (or its article) in the sidebar is clicked:
  // – If it’s a query node, set it as active and re-run the search.
  // – If it’s an article node, open its URL.
  const handleQueryClick = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else {
      setActiveQueryId(item.id);
      setQuery(item.query);
      doSearch(item.query);
    }
  };

  // Delete a node from the history.
  // For type "query", remove the entire query node.
  // For type "link", remove that article from the parent query.
  const handleDelete = (id, type, parentId = null) => {
    if (type === 'query') {
      setHistory((prev) => prev.filter((q) => q.id !== id));
      if (activeQueryId === id) {
        setActiveQueryId(null);
      }
    } else if (type === 'link' && parentId) {
      setHistory((prev) =>
        prev.map((q) => {
          if (q.id === parentId) {
            return { ...q, articles: q.articles.filter((a) => a.id !== id) };
          }
          return q;
        })
      );
    }
  };

  // Toggle the sidebar open/collapsed.
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Toggle expansion of a query node's articles list.
  const toggleNodeExpansion = (id, newValue) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: newValue }));
  };

  return (
    <div className="app-container">
      <HistorySidebar
        history={history}
        expandedNodes={expandedNodes}
        onToggle={toggleNodeExpansion}
        onQueryClick={handleQueryClick}
        onDelete={handleDelete}
        activeQueryId={activeQueryId}
        isOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
      <div className="main-content">
        <header className="app-header">
          <h1 className="app-title">ReadA.Wiki</h1>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search with OpenFiche..."
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
                viewBox="0 0 24 24"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </header>
        <section className="results">
          {loading && <p className="loading">Loading...</p>}
          {error && <p className="error">{error}</p>}
          {results.map((result) => (
            <div key={result.pageid} className="result-item">
              <h2 className="result-title">
                <a
                  href={`https://en.wikipedia.org/?curid=${result.pageid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleResultClick(result)}
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
                onClick={() => handleResultClick(result)}
              >
                Read more
              </a>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;
