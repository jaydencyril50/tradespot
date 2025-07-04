import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Market.css';

const BuySpotPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="market-root">
      <div className="market-header">
        <span className="market-header-title">BUY SPOT</span>
      </div>
    </div>
  );
};

export default BuySpotPage;
