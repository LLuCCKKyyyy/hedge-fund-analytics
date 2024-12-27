import axios from 'axios';
import { StockPrice } from './types';

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
        adjclose: Array<{
          adjclose: number[];
        }>;
      };
    }>;
  };
}

interface YahooFinanceQuoteSummary {
  quoteSummary: {
    result: Array<{
      assetProfile?: {
        sector?: string;
        industry?: string;
      };
      price?: {
        regularMarketPrice?: {
          raw: number;
        };
      };
    }>;
  };
}

export const getStockPrices = async (
  symbols: string[],
  startDate: Date,
  endDate: Date
): Promise<Record<string, Record<string, number>>> => {
  const pricesMap: Record<string, Record<string, number>> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const response = await axios.get<YahooFinanceResponse>(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
          {
            params: {
              period1: Math.floor(startDate.getTime() / 1000),
              period2: Math.floor(endDate.getTime() / 1000),
              interval: '1d',
            },
          }
        );

        const result = response.data.chart.result[0];
        if (!result) {
          return;
        }

        const { timestamp, indicators } = result;
        const quote = indicators.quote[0];
        const adjClose = indicators.adjclose[0].adjclose;

        pricesMap[symbol] = {};
        timestamp.forEach((time, i) => {
          const date = new Date(time * 1000).toISOString().split('T')[0];
          pricesMap[symbol][date] = adjClose[i];
        });
      } catch (error) {
        console.error(`Error fetching prices for ${symbol}:`, error);
      }
    })
  );

  return pricesMap;
};

export const getStockInfo = async (symbol: string) => {
  try {
    const response = await axios.get<YahooFinanceQuoteSummary>(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,price,assetProfile`
    );
    return response.data.quoteSummary.result[0];
  } catch (error) {
    console.error('Error fetching stock info:', error);
    return null;
  }
};
