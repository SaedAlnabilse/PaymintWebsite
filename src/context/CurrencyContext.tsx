import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../config/api';
import { useAuth } from './AuthContext';
import { CURRENCIES as GLOBAL_CURRENCIES } from '../data/globalLocaleOptions';
import { formatCurrencyCode, normalizeCurrencyCode } from '../utils/currency';

export { CURRENCIES } from '../data/globalLocaleOptions';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  refreshCurrency: () => Promise<void>;
  formatAmount: (amount: number | string | null | undefined) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { isAuthenticated, currentEstablishment } = useAuth();
  const [currency, setCurrency] = useState<string>('JOD');
  const [loading, setLoading] = useState(true);

  // Kept as currencySymbol for existing consumers, but it intentionally stores the ISO code.
  const currencySymbol = normalizeCurrencyCode(GLOBAL_CURRENCIES.find(c => c.code === currency)?.symbol || currency);

  // Refresh currency from backend
  const refreshCurrency = useCallback(async () => {
    if (!isAuthenticated || !currentEstablishment) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/app-settings');
      const data = response.data;
      if (data.currency) {
        setCurrency(data.currency.toUpperCase());
      }
    } catch (error) {
      console.error('Failed to refresh currency:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentEstablishment]);

  // Load currency on mount and poll periodically
  useEffect(() => {
    if (isAuthenticated && currentEstablishment) {
      refreshCurrency();

      // Poll for currency updates every 30 seconds (to sync with POS)
      const intervalId = setInterval(() => {
        refreshCurrency();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [refreshCurrency, isAuthenticated, currentEstablishment]);

  // Format amount with currency (symbol after amount for consistency)
  const formatAmount = (amount: number | string | null | undefined): string => {
    const locale = localStorage.getItem('i18nextLng') || 'en';
    return formatCurrencyCode(amount, currencySymbol, locale);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        refreshCurrency,
        formatAmount,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
