import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PortfolioItem {
    id: string;
    name: string;
    quantity: number;
    value: number;
}

const Portfolio: React.FC = () => {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/portfolio', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPortfolio(res.data.portfolio || []);
            } catch (err) {
                setError('Failed to fetch portfolio data');
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Your Portfolio</h2>
            <ul>
                {portfolio.length === 0 && <li>No portfolio data.</li>}
                {portfolio.map(item => (
                    <li key={item.id}>
                        {item.name}: {item.quantity} units valued at ${item.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Portfolio;