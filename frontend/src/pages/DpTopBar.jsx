import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpIcon from './DpIcon.jsx';

// Shared header for every section detail page: a back link to the
// homepage (scrolls back to the section it came from) plus the brand.
export default function DpTopBar({ backTo = '/', backLabel = 'Back to home' }) {
  const navigate = useNavigate();
  return (
    <div className="dp-top">
      <button className="dp-back" onClick={() => navigate(backTo)}>
        <DpIcon name="arrow-left" size={18} /> {backLabel}
      </button>
      <div className="dp-brand">
        <span className="dp-brand-icon"><DpIcon name="mic" size={16} /></span>
        SpeakUp
      </div>
    </div>
  );
}