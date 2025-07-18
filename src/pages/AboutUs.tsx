import React from "react";
import { useTheme } from '../ThemeContext';
import '../theme.css';

const AboutUs: React.FC = () => {
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0}}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          🌍 About TradeSpot
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        <div
          className="card"
          style={{
            borderRadius: 0,
            minWidth: 200,
            maxWidth: 800,
            width: '100%',
            textAlign: 'left',
            marginBottom: 0,
            fontFamily: 'inherit',
            boxShadow: 'var(--card-shadow)',
            background: 'var(--card-bg)',
            padding: '2.5rem',
          }}
        >
          <p style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            TradeSpot is more than a platform—it's a global revolution in crypto empowerment.
          </p>
          <p style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            Born out of the need to eliminate fear, loss, and confusion in the crypto space, TradeSpot stands as a secure, intelligent, and profit-driven ecosystem designed for everyone—whether you’re just starting your journey or already playing at the top.
          </p>
          <p style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            With an independent SPOT/USDT market, bulletproof Locked & Loaded security, and a fully self-sustained economy, TradeSpot puts you in full control of your financial future. No guesswork. No stress. Just opportunity, empowerment, and consistent gains.
          </p>
          <h2 style={{ fontWeight: 600, fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>🔑 What Sets Us Apart</h2>
          <ul style={{ fontSize: '1.1rem', marginBottom: '1.5rem', paddingLeft: '1.5rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            <li>Profit-Based P2P Trading – Buy low, sell high, by design—not by chance.</li>
            <li>Real-Time Human Support – Help when you need it, not hours later.</li>
            <li>Beginner-First UI – Clean, intuitive, and welcoming for all users.</li>
            <li>Flex Drop Rewards – Loyalty pays. Literally.</li>
            <li>Monthly TradeFestival – A celebration of trading excellence, open to all.</li>
            <li>VIP Club Access – For top performers who lead the charge.</li>
            <li>The TradeSpot Social Hub – A crypto-native social media experience built to connect, compete, and celebrate.</li>
          </ul>
          <p style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            We are already live and scaling fast—continually evolving to meet the needs of our users and stay ahead of the curve. TradeSpot is not a prototype. It’s a full-force platform backed by a clear mission and a powerful community.
          </p>
          <h2 style={{ fontWeight: 600, fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>🚀 Our Vision</h2>
          <p style={{ fontSize: '1.15rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            A world where crypto is 0% struggle, 0% fear, and 100% drive.<br />
            Where anyone—minor or mighty—can grow, thrive, and profit confidently.
          </p>
          <p style={{ fontSize: '1.15rem', marginTop: '1rem', color: theme === 'dark' ? '#fff' : 'var(--secondary)' }}>
            TradeSpot isn’t just building the future of finance.<br />
            We’re redefining what’s possible in crypto.
          </p>
        </div>
        <style>
          {`
            @media (max-width: 600px) {
              div[style*="box-shadow"] {
                max-width: 90vw !important;
                min-width: 0 !important;
                width: 90vw !important;
                margin-left: 5vw !important;
                margin-right: 5vw !important;
                padding: 10px 2vw !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AboutUs;
