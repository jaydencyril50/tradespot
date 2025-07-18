import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../theme.css';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    axios.get('/api/faq')
      .then(res => {
        setFaqs(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load FAQs');
        setLoading(false);
      });
  }, []);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 0, paddingBottom: 20 }}>
      <div className="faq-header" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', background: 'var(--card-bg)', padding: '16px 0 10px 0', border: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <span className="faq-title" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif', textAlign: 'left', width: '100%', paddingLeft: 24 }}>
          FAQ
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 14, width: '100%' }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#d32f2f', marginTop: 16 }}>{error}</p>}
        {faqs.map((faq, idx) => (
          <div
            key={faq._id}
            className="card"
            style={{
              borderRadius: 5,
              minWidth: 0,
              maxWidth: 540,
              width: '100%',
              textAlign: 'left',
              marginBottom: 0,
              fontFamily: 'inherit',
              boxShadow: 'var(--card-shadow)',
              background: 'var(--card-bg)',
              padding: '14px 12px',
              fontSize: '1rem',
            }}
          >
            <button
              className="button"
              style={{
                width: '100%',
                background: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
                marginBottom: 8,
                cursor: 'pointer',
                lineHeight: 1.3,
              }}
              onClick={() => toggleAccordion(idx)}
            >
              <span style={{ flex: 1 }}>{faq.question}</span>
              <span style={{ fontSize: '1.2rem', marginLeft: 8 }}>{openIndex === idx ? '▲' : '▼'}</span>
            </button>
            {openIndex === idx && (
              <div style={{ padding: '8px 0 0 0', color: '#444', fontSize: '0.98rem', wordBreak: 'break-word' }}>{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .faq-header {
            width: 100vw !important;
            margin-left: calc(-50vw + 50%) !important;
            padding: 10px 0 8px 0 !important;
          }
          .faq-title {
            font-size: 1.5rem !important;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-align: left !important;
            padding-left: 12px !important;
          }
          .card {
            max-width: 96vw !important;
            width: 96vw !important;
            padding: 8px 4px !important;
            font-size: 0.98rem !important;
          }
          .button {
            font-size: 0.90rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
