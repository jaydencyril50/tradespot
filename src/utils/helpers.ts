export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const calculateInvestmentReturn = (initialInvestment: number, currentValue: number): number => {
    return ((currentValue - initialInvestment) / initialInvestment) * 100;
};

export const isValidCryptoAmount = (amount: number): boolean => {
    return amount > 0;
};