import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Market.css';

interface Buyer {
  username: string;
  userId: string;
  vipLevel: number;
  spotBalance: number;
  minLimit: number;
  maxLimit: number;
  status: string;
  rating: number;
  reviews: string[];
}

const BuySpotPage: React.FC = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/p2p/buyers`);
        const data = await res.json();
        setBuyers(data);
      } catch (err) {
        console.error('Error fetching buyers:', err);
      }
    };

    fetchBuyers();
  }, []);

  return (
    <div className="market-root">
      <div className="market-header">
        <span className="market-header-title">BUY SPOT</span>
      </div>

      <div className="market-list">
        {buyers.map((buyer) => (
          <div className="market-card" key={buyer.userId}>
            <h3>{buyer.username}#{buyer.userId}</h3>
            <p>Status: {buyer.status}</p>
            <p>VIP Level: {buyer.vipLevel}</p>
            <p>Balance: {buyer.spotBalance} SPOT</p>
            <p>Trade Range: ${buyer.minLimit} - ${buyer.maxLimit}</p>
            <p>Rating: ⭐ {buyer.rating}</p>
            <ul>
              {buyer.reviews.map((r, i) => (
                <li key={i}>“{r}”</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuySpotPage;
