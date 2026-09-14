import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

export default function DpTopBar({ backLabel = 'Back' }) {
  const navigate = useNavigate();
  return (
    <div className="dp-top">
      <button className="dp-back" onClick={() => navigate('/')}>
        ← {backLabel}
      </button>
      <div className="dp-brand nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="nav-brand-icon" style={{ width: 34, height: 34 }}>
          <Logo size={30} />
        </div>
        <span className="brand-wordmark" style={{ fontSize: '1.3em' }}>
          Speak<span className="brand-accent">Up</span>
        </span>
      </div>
    </div>
  );
}