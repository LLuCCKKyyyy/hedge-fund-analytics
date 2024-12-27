import { Fund, Filing13F, FundMetrics, HoldingData } from './api/types';
import { getLatestFiling, getFundList } from './api/edgarApi';
import { getStockPrices } from './api/yahooFinanceApi';
import { cacheService } from './cache/cacheService';

class FundDataService {
  private readonly TIGER_GLOBAL_CIK = '0001167483';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async getFunds(): Promise<Fund[]> {
    // For testing, we'll focus on Tiger Global
    return [{
      id: '1',
      name: 'Tiger Global Management LLC',
      cik: this.TIGER_GLOBAL_CIK
    }];
  }

  async getFundHoldings(cik: string): Promise<Filing13F | null> {
    try {
      const filing = await getLatestFiling(cik);
      if (!filing) return null;

      const holdings = filing.holdings.map(holding => ({
        ...holding,
        symbol: holding.cusip,
        name: holding.nameOfIssuer,
        marketValue: holding.value,
        percentOfPortfolio: (holding.value / filing.holdings.reduce((sum, h) => sum + h.value, 0)) * 100,
        quarterlyChange: 0, // Placeholder, requires historical data
      }));

      return {
        ...filing,
        holdings
      };
    } catch (error) {
      console.error('Error fetching fund holdings:', error);
      return null;
    }
  }

  async getFundPerformance(holdings: HoldingData[], startDate: Date, endDate: Date): Promise<any[]> {
    const cacheKey = `performance_${startDate.getTime()}_${endDate.getTime()}`;
    const cachedData = cacheService.get<any[]>(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    // 获取所有持仓的历史价格
    const performanceData = [];
    const symbols = holdings.map(h => h.symbol);
    
    try {
      const pricesMap = await getStockPrices(symbols, startDate, endDate);
      
      // 计算每日投资组合价值
      const dates = Object.keys(pricesMap[symbols[0]] || {}).sort();
      
      for (const date of dates) {
        let portfolioValue = 0;
        let benchmarkValue = 100; // 使用S&P 500作为基准，起始值为100
        
        for (const holding of holdings) {
          const price = pricesMap[holding.symbol]?.[date];
          if (price) {
            portfolioValue += (price * holding.marketValue);
          }
        }
        
        performanceData.push({
          date,
          value: portfolioValue,
          benchmark: benchmarkValue
        });
      }
      
      cacheService.set(cacheKey, performanceData, this.CACHE_TTL);
      return performanceData;
    } catch (error) {
      console.error('Error calculating fund performance:', error);
      return [];
    }
  }

  async calculateFundMetrics(holdings: HoldingData[]): Promise<FundMetrics> {
    try {
      // 计算基本指标
      const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
      const numHoldings = holdings.length;

      // 计算集中度
      const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
      const top10Value = sortedHoldings.slice(0, 10).reduce((sum, h) => sum + h.marketValue, 0);
      const concentration = (top10Value / totalValue) * 100;

      // 获取历史表现数据用于计算波动率和夏普比率
      const volatility = 0; // Placeholder
      const sharpeRatio = 0; // Placeholder

      return {
        alpha: 0, // Placeholder
        beta: 0, // Placeholder
        sharpeRatio,
        volatility,
        maxDrawdown: 0, // Placeholder
        returns: {
          daily: 0, // Placeholder
          weekly: 0, // Placeholder
          monthly: 0, // Placeholder
          quarterly: 0, // Placeholder
          yearly: 0, // Placeholder
        }
      };
    } catch (error) {
      console.error('Error calculating fund metrics:', error);
      return {
        alpha: 0,
        beta: 0,
        sharpeRatio: 0,
        volatility: 0,
        maxDrawdown: 0,
        returns: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          quarterly: 0,
          yearly: 0,
        }
      };
    }
  }

  private calculateReturns(performanceData: any[]): number[] {
    const returns = [];
    for (let i = 1; i < performanceData.length; i++) {
      const prevValue = performanceData[i - 1].value;
      const currentValue = performanceData[i].value;
      returns.push((currentValue - prevValue) / prevValue);
    }
    return returns;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252); // 年化波动率
  }

  private calculateSharpeRatio(returns: number[], volatility: number): number {
    if (returns.length === 0 || volatility === 0) return 0;
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const riskFreeRate = 0.02; // 假设无风险利率为2%
    return (meanReturn - riskFreeRate) / volatility;
  }
}

export const fundDataService = new FundDataService();
