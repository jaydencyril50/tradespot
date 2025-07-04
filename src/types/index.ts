export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface PortfolioItem {
    id: string;
    name: string;
    quantity: number;
    value: number;
}

export interface TradeTransaction {
    id: string;
    userId: string;
    cryptoId: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    timestamp: Date;
}