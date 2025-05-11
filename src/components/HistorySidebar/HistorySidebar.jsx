import React, { useState } from 'react';
import './HistorySidebar.css';

/**
 * HistorySidebar Component
 *
 * Displays two separate header elements:
 *  - expanded-header (icon + "Search History") when isOpen is true
 *  - collapsed-header (icon only) when isOpen is false
 * Below that, we only render the history list if isOpen is true.
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
      {isOpen ? (
        <div className="expanded-header" onClick={onToggleSidebar}>
          <span className="sidebar-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
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
          <h2 className="sidebar-title">Search History</h2>
        </div>
      ) : (
        <div className="collapsed-header" onClick={onToggleSidebar}>
          <span className="sidebar-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
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
        </div>
      )}

      {isOpen && (
        <ul className="history-tree">
          {history.map((queryItem) => {
            // Is this query expanded or collapsed?
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
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
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

export default HistorySidebar;