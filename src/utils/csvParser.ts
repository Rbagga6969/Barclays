import { EquityTrade, FXTrade } from '../types/trade';

export const parseEquityCSV = (csvText: string): EquityTrade[] => {
  const lines = csvText.split('\n');
  const trades: EquityTrade[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    if (columns.length < 23) continue;
    
    trades.push({
      tradeId: columns[0],
      orderId: columns[1],
      clientId: columns[2],
      tradeType: columns[5] as 'Buy' | 'Sell',
      quantity: parseInt(columns[6]) || 0,
      price: parseFloat(columns[7]) || 0,
      tradeValue: parseFloat(columns[8]) || 0,
      currency: columns[9],
      tradeDate: columns[10],
      settlementDate: columns[11],
      counterparty: columns[13],
      tradingVenue: columns[14],
      traderName: columns[15],
      confirmationStatus: columns[21] as 'Confirmed' | 'Pending' | 'Failed' | 'Settled',
      countryOfTrade: columns[22],
      opsTeamNotes: columns[23]
    });
  }
  
  return trades;
};

export const parseFXCSV = (csvText: string): FXTrade[] => {
  const lines = csvText.split('\n');
  const trades: FXTrade[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    if (columns.length < 32) continue;
    
    trades.push({
      tradeId: columns[0],
      tradeDate: columns[1],
      valueDate: columns[2],
      tradeTime: columns[3],
      traderId: columns[4],
      counterparty: columns[5],
      currencyPair: columns[6],
      buySell: columns[7] as 'Buy' | 'Sell',
      dealtCurrency: columns[8],
      baseCurrency: columns[9],
      termCurrency: columns[10],
      tradeStatus: columns[13] as 'Booked' | 'Confirmed' | 'Settled' | 'Cancelled',
      productType: columns[18] as 'Spot' | 'Forward' | 'Swap',
      maturityDate: columns[19],
      confirmationTimestamp: columns[20],
      settlementDate: columns[21],
      amendmentFlag: columns[26] as 'Yes' | 'No',
      confirmationMethod: columns[30] as 'SWIFT' | 'Email' | 'Electronic' | 'Manual',
      confirmationStatus: columns[31] as 'Confirmed' | 'Pending' | 'Disputed'
    });
  }
  
  return trades;
};