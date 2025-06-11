import React, { useState } from 'react';

const Trade: React.FC = () => {
    const [crypto, setCrypto] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [message, setMessage] = useState('');

    const handleTrade = () => {
        if (!crypto || !amount) {
            setMessage('Please enter both cryptocurrency and amount.');
            return;
        }

        // Here you would typically call an API to execute the trade
        setMessage(`Successfully ${transactionType} ${amount} of ${crypto}.`);
    };

    return (
        <div>
            <h2>Trade Cryptocurrency</h2>
            <div>
                <label>
                    Cryptocurrency:
                    <input
                        type="text"
                        value={crypto}
                        onChange={(e) => setCrypto(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Transaction Type:
                    <select
                        value={transactionType}
                        onChange={e => setTransactionType(e.target.value === 'buy' ? 'buy' : 'sell')}
                    >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                </label>
            </div>
            <button onClick={handleTrade}>Execute Trade</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Trade;