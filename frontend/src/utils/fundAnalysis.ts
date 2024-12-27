export interface FundMetrics {
  alpha: number;
  beta: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
}

export interface HoldingData {
  symbol: string;
  name: string;
  shares: number;
  marketValue: number;
  percentOfPortfolio: number;
  quarterlyChange: number;
}

export interface HistoricalPerformance {
  date: string;
  value: number;
  benchmark: number;
}

// Calculate Sharpe Ratio
export const calculateSharpeRatio = (returns: number[], riskFreeRate: number): number => {
  const excessReturns = returns.map(r => r - riskFreeRate);
  const avgExcessReturn = excessReturns.reduce((a, b) => a + b) / excessReturns.length;
  const stdDev = Math.sqrt(
    excessReturns.reduce((a, b) => a + Math.pow(b - avgExcessReturn, 2), 0) / 
    (excessReturns.length - 1)
  );
  return avgExcessReturn / stdDev;
};

// Calculate Maximum Drawdown
export const calculateMaxDrawdown = (values: number[]): number => {
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  return maxDrawdown;
};

// Calculate Beta
export const calculateBeta = (fundReturns: number[], marketReturns: number[]): number => {
  const n = fundReturns.length;
  const avgFund = fundReturns.reduce((a, b) => a + b) / n;
  const avgMarket = marketReturns.reduce((a, b) => a + b) / n;
  
  const covariance = fundReturns.reduce((sum, fr, i) => 
    sum + (fr - avgFund) * (marketReturns[i] - avgMarket), 0) / (n - 1);
  
  const marketVariance = marketReturns.reduce((sum, mr) => 
    sum + Math.pow(mr - avgMarket, 2), 0) / (n - 1);
  
  return covariance / marketVariance;
};

// Calculate Alpha
export const calculateAlpha = (
  fundReturn: number,
  marketReturn: number,
  beta: number,
  riskFreeRate: number
): number => {
  return fundReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
};

// Calculate Portfolio Statistics
export const calculatePortfolioStats = (holdings: HoldingData[]): {
  totalValue: number;
  topHoldings: HoldingData[];
  sectorConcentration: { [key: string]: number };
} => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const topHoldings = [...holdings]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 10);
    
  return {
    totalValue,
    topHoldings,
    sectorConcentration: {} // To be implemented with sector data
  };
};
