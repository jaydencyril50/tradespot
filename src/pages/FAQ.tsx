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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', padding: '16px 24px 10px 18px', border: '1.5px solid var(--secondary)', borderTop: 0, borderLeft: 0, borderRight: 0}}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, fontFamily: 'serif' }}>
          FAQ
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 20 }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#d32f2f', marginTop: 16 }}>{error}</p>}
        {faqs.map((faq, idx) => (
          <div key={faq._id} className="card" style={{ borderRadius: 0, minWidth: 200, maxWidth: 480, width: '100%', textAlign: 'left', marginBottom: 0, fontFamily: 'inherit', boxShadow: 'var(--card-shadow)', background: 'var(--card-bg)', padding: '18px 24px' }}>
            <button
              className="button"
              style={{ width: '100%', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '1.08rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', boxShadow: 'none', padding: 0, marginBottom: 8, cursor: 'pointer' }}
              onClick={() => toggleAccordion(idx)}
            >
              {faq.question}
              <span style={{ fontSize: '1.2rem', marginLeft: 8 }}>{openIndex === idx ? '▲' : '▼'}</span>
            </button>
            {openIndex === idx && (
              <div style={{ padding: '8px 0 0 0', color: '#444', fontSize: '1rem' }}>{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
