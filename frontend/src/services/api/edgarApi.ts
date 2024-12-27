import axios from 'axios';
import { Filing13F, Fund } from './types';

const BASE_URL = 'https://www.sec.gov/Archives/edgar/data';
const SUBMISSIONS_URL = 'https://data.sec.gov/submissions';

interface EdgarSubmissionsResponse {
  filings: {
    recent: {
      accessionNumber: string[];
      form: string[];
      filingDate: string[];
      reportDate: string[];
    };
  };
}

interface YahooFinanceResponse {
  quoteSummary: {
    result: Array<{
      assetProfile?: {
        sector?: string;
        industry?: string;
      };
    }>;
  };
}

// Configure axios for SEC EDGAR API
const edgarAxios = axios.create({
  headers: {
    'User-Agent': 'HedgeFundAnalytics research.contact@example.com',
    'Accept-Encoding': 'gzip, deflate',
  },
});

export const getLatestFiling = async (cik: string): Promise<Filing13F | null> => {
  try {
    // Get the company's submissions
    const response = await edgarAxios.get<EdgarSubmissionsResponse>(
      `${SUBMISSIONS_URL}/CIK${cik.padStart(10, '0')}.json`
    );

    // Find the latest 13F-HR filing
    const filings = response.data.filings.recent;
    const latestF13Index = filings.form.findIndex(
      (form: string) => form === '13F-HR'
    );

    if (latestF13Index === -1) {
      return null;
    }

    const accessionNumber = filings.accessionNumber[latestF13Index].replace(
      /-/g,
      ''
    );

    // Get the actual 13F filing data
    const filingUrl = `${BASE_URL}/${cik.padStart(10, '0')}/${accessionNumber}/primary-doc.xml`;
    const filingResponse = await edgarAxios.get<string>(filingUrl);

    // Parse the XML filing data
    const holdings = await parseXMLFiling(filingResponse.data);

    // Get industry data from Yahoo Finance API
    const holdingsWithIndustry = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const response = await axios.get<YahooFinanceResponse>(
            `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${holding.cusip}?modules=assetProfile`
          );
          const profile = response.data.quoteSummary.result[0]?.assetProfile;
          return {
            ...holding,
            symbol: holding.cusip,
            name: holding.nameOfIssuer,
            marketValue: holding.value,
            percentOfPortfolio: 0, // Placeholder
            quarterlyChange: 0, // Placeholder
            sector: profile?.sector || 'Unknown',
            industry: profile?.industry || 'Unknown',
          };
        } catch (error) {
          console.error(`Error fetching industry data for ${holding.cusip}:`, error);
          return {
            ...holding,
            symbol: holding.cusip,
            name: holding.nameOfIssuer,
            marketValue: holding.value,
            percentOfPortfolio: 0, // Placeholder
            quarterlyChange: 0, // Placeholder
            sector: 'Unknown',
            industry: 'Unknown',
          };
        }
      })
    );

    return {
      accessionNumber,
      filingDate: filings.filingDate[latestF13Index],
      formType: filings.form[latestF13Index],
      holdings: holdingsWithIndustry,
      periodOfReport: filings.reportDate[latestF13Index],
    };
  } catch (error) {
    console.error('Error fetching filing:', error);
    return null;
  }
};

export const getFundList = async (): Promise<Fund[]> => {
  try {
    const response = await fetch('/api/funds');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching fund list:', error);
    return [];
  }
};

// Helper function to parse XML filing data
const parseXMLFiling = (xmlData: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
  const holdings = [];

  const informationTable = xmlDoc.getElementsByTagName('informationTable')[0];
  if (!informationTable) return [];

  const entries = informationTable.getElementsByTagName('infoTable');

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    holdings.push({
      nameOfIssuer: getElementText(entry, 'nameOfIssuer'),
      titleOfClass: getElementText(entry, 'titleOfClass'),
      cusip: getElementText(entry, 'cusip'),
      value: parseInt(getElementText(entry, 'value')) * 1000, // Values are reported in thousands
      shares: parseInt(getElementText(entry, 'shrsOrPrnAmt/sshPrnamt')),
      sshPrnamtType: getElementText(entry, 'shrsOrPrnAmt/sshPrnamtType'),
      investmentDiscretion: getElementText(entry, 'investmentDiscretion'),
      sector: '',  // Will be filled later
      industry: '', // Will be filled later
      votingAuthority: {
        sole: parseInt(getElementText(entry, 'votingAuthority/Sole')),
        shared: parseInt(getElementText(entry, 'votingAuthority/Shared')),
        none: parseInt(getElementText(entry, 'votingAuthority/None')),
      },
    });
  }

  return holdings;
};

const getElementText = (parent: Element, tagName: string): string => {
  const element = parent.getElementsByTagName(tagName)[0];
  return element ? element.textContent || '' : '';
};
