export interface Fund {
  id: string;
  name: string;
  cik: string;
  description?: string;
}

export interface Filing13F {
  accessionNumber: string;
  filingDate: string;
  formType: string;
  holdings: HoldingData[];
  periodOfReport: string;
}

export interface Holding {
  nameOfIssuer: string;
  titleOfClass: string;
  cusip: string;
  value: number;
  shares: number;
  sshPrnamtType: string;
  investmentDiscretion: string;
  sector: string;
  industry: string;
  votingAuthority: {
    sole: number;
    shared: number;
    none: number;
  };
}

export interface HoldingData {
  symbol: string;
  name: string;
  cusip: string;
  shares: number;
  marketValue: number;
  percentOfPortfolio: number;
  quarterlyChange: number;
  sector: string;
  industry: string;
  sshPrnamtType: string;
  nameOfIssuer: string;
  titleOfClass: string;
  value: number;
  investmentDiscretion: string;
  votingAuthority: {
    sole: number;
    shared: number;
    none: number;
  };
}

export interface SectorAnalysis {
  sector: string;
  totalValue: number;
  percentOfPortfolio: number;
  industries: {
    name: string;
    value: number;
    percentOfSector: number;
  }[];
}

export interface StockPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface FundPerformance {
  date: string;
  value: number;
  benchmark: number;
}

export interface FundMetrics {
  alpha: number;
  beta: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  returns: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
}
