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

// Helper for 1:1 conversion (if needed in UI)
export const convertUsdtToFlex = (usdt: number): number => usdt; // 1:1
export const convertFlexToUsdt = (flex: number): number => flex; // 1:1