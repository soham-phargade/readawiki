import React from 'react';
import Popup from 'reactjs-popup';
import './Modal.css';

function ModalPopup({ isSidebarOpen, open, closeModal }) {
  return (
    <Popup open={open} closeOnDocumentClick onClose={closeModal}>
      <div className={`modal ${isSidebarOpen ? 'with-sidebar' : ''}`}>
        <h3>About OpenFiche</h3>
        <p>
          OpenFiche was a project built at SpartaHack X. We reflected on how Google Search's current algorithm has been declining in quality, leading it to produce less relevant
          results, as the <a target='_blank' href="https://downloads.webis.de/publications/papers/bevendorff_2024a.pdf" rel="noopener noreferrer">SEO is slammed with tags</a>. We remember how effective Google Search's algorithm used to be before 
          SEO tagging became commonplace, and in hopes to return to a search engine of this quality, we reimplemented Google's Pagerank indexing Wikipedia (CS-related articles), CNN, and NPR using PageRank + 
          keyword scoring. This allowed us to rank pages based on relevance, not SEO tricks, and we complimented this tool with a minimalist web browser that helps academics zone in on their research.
        </p>
      </div>
    </Popup>
  );
}

export default ModalPopup;
