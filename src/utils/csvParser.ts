import { EquityTrade, FXTrade } from '../types/trade';

export const parseGenericCSV = (csvText: string): { headers: string[], rows: string[][] } => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => 
    line.split(',').map(cell => cell.trim().replace(/"/g, ''))
  );

  return { headers, rows };
};

export const convertGenericToTrades = (data: { headers: string[], rows: string[][] }): (EquityTrade | FXTrade)[] => {
  const trades: (EquityTrade | FXTrade)[] = [];
  
  // Try to detect if it's equity or FX based on headers
  const hasEquityHeaders = data.headers.some(h => 
    ['orderId', 'quantity', 'price', 'tradeValue'].some(field => 
      h.toLowerCase().includes(field.toLowerCase())
    )
  );
  
  const hasFXHeaders = data.headers.some(h => 
    ['currencyPair', 'buySell', 'valueDate', 'productType'].some(field => 
      h.toLowerCase().includes(field.toLowerCase())
    )
  );

  data.rows.forEach((row, index) => {
    if (row.length < data.headers.length) return;
    
    try {
      if (hasEquityHeaders) {
        // Create equity trade
        const trade: EquityTrade = {
          tradeId: row[data.headers.findIndex(h => h.toLowerCase().includes('tradeid') || h.toLowerCase().includes('trade id'))] || `TRADE_${index + 1}`,
          orderId: row[data.headers.findIndex(h => h.toLowerCase().includes('orderid') || h.toLowerCase().includes('order id'))] || `ORDER_${index + 1}`,
          clientId: row[data.headers.findIndex(h => h.toLowerCase().includes('clientid') || h.toLowerCase().includes('client id'))] || `CLIENT_${index + 1}`,
          tradeType: (row[data.headers.findIndex(h => h.toLowerCase().includes('tradetype') || h.toLowerCase().includes('type'))] || 'Buy') as 'Buy' | 'Sell',
          quantity: parseInt(row[data.headers.findIndex(h => h.toLowerCase().includes('quantity'))] || '100') || 100,
          price: parseFloat(row[data.headers.findIndex(h => h.toLowerCase().includes('price'))] || '100') || 100,
          tradeValue: parseFloat(row[data.headers.findIndex(h => h.toLowerCase().includes('value') || h.toLowerCase().includes('amount'))] || '10000') || 10000,
          currency: row[data.headers.findIndex(h => h.toLowerCase().includes('currency'))] || 'USD',
          tradeDate: row[data.headers.findIndex(h => h.toLowerCase().includes('tradedate') || h.toLowerCase().includes('date'))] || new Date().toISOString().split('T')[0],
          settlementDate: row[data.headers.findIndex(h => h.toLowerCase().includes('settlement'))] || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          counterparty: row[data.headers.findIndex(h => h.toLowerCase().includes('counterparty') || h.toLowerCase().includes('broker'))] || 'Unknown Counterparty',
          tradingVenue: row[data.headers.findIndex(h => h.toLowerCase().includes('venue') || h.toLowerCase().includes('exchange'))] || 'NYSE',
          traderName: row[data.headers.findIndex(h => h.toLowerCase().includes('trader'))] || 'Unknown Trader',
          confirmationStatus: (row[data.headers.findIndex(h => h.toLowerCase().includes('status') || h.toLowerCase().includes('confirmation'))] || 'Pending') as 'Confirmed' | 'Pending' | 'Failed' | 'Settled',
          countryOfTrade: row[data.headers.findIndex(h => h.toLowerCase().includes('country'))] || 'US',
          opsTeamNotes: row[data.headers.findIndex(h => h.toLowerCase().includes('notes') || h.toLowerCase().includes('comments'))] || 'Imported from Excel'
        };
        trades.push(trade);
      } else {
        // Create FX trade
        const trade: FXTrade = {
          tradeId: row[data.headers.findIndex(h => h.toLowerCase().includes('tradeid') || h.toLowerCase().includes('trade id'))] || `FX_${index + 1}`,
          tradeDate: row[data.headers.findIndex(h => h.toLowerCase().includes('tradedate') || h.toLowerCase().includes('date'))] || new Date().toISOString().split('T')[0],
          valueDate: row[data.headers.findIndex(h => h.toLowerCase().includes('valuedate') || h.toLowerCase().includes('value date'))] || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tradeTime: row[data.headers.findIndex(h => h.toLowerCase().includes('time'))] || '10:00:00',
          traderId: row[data.headers.findIndex(h => h.toLowerCase().includes('trader'))] || 'Unknown Trader',
          counterparty: row[data.headers.findIndex(h => h.toLowerCase().includes('counterparty') || h.toLowerCase().includes('broker'))] || 'Unknown Counterparty',
          currencyPair: row[data.headers.findIndex(h => h.toLowerCase().includes('currencypair') || h.toLowerCase().includes('pair'))] || 'EUR/USD',
          buySell: (row[data.headers.findIndex(h => h.toLowerCase().includes('buysell') || h.toLowerCase().includes('side'))] || 'Buy') as 'Buy' | 'Sell',
          dealtCurrency: row[data.headers.findIndex(h => h.toLowerCase().includes('dealt'))] || 'EUR',
          baseCurrency: row[data.headers.findIndex(h => h.toLowerCase().includes('base'))] || 'EUR',
          termCurrency: row[data.headers.findIndex(h => h.toLowerCase().includes('term'))] || 'USD',
          tradeStatus: (row[data.headers.findIndex(h => h.toLowerCase().includes('tradestatus'))] || 'Booked') as 'Booked' | 'Confirmed' | 'Settled' | 'Cancelled',
          productType: (row[data.headers.findIndex(h => h.toLowerCase().includes('product'))] || 'Spot') as 'Spot' | 'Forward' | 'Swap',
          maturityDate: row[data.headers.findIndex(h => h.toLowerCase().includes('maturity'))] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          confirmationTimestamp: row[data.headers.findIndex(h => h.toLowerCase().includes('confirmation'))] || new Date().toISOString(),
          settlementDate: row[data.headers.findIndex(h => h.toLowerCase().includes('settlement'))] || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amendmentFlag: (row[data.headers.findIndex(h => h.toLowerCase().includes('amendment'))] || 'No') as 'Yes' | 'No',
          confirmationMethod: (row[data.headers.findIndex(h => h.toLowerCase().includes('method'))] || 'Electronic') as 'SWIFT' | 'Email' | 'Electronic' | 'Manual',
          confirmationStatus: (row[data.headers.findIndex(h => h.toLowerCase().includes('status'))] || 'Pending') as 'Confirmed' | 'Pending' | 'Disputed'
        };
        trades.push(trade);
      }
    } catch (error) {
      console.warn(`Failed to parse row ${index + 1}:`, error);
    }
  });
  
  return trades;
};

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