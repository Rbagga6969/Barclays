import { EquityTrade, FXTrade } from '../types/trade';

export const parseGenericCSV = (csvText: string): { headers: string[], rows: string[][] } => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => 
    line.split(',').map(cell => cell.trim().replace(/"/g, ''))
  ).filter(row => row.length > 1 && row.some(cell => cell.trim())); // Filter out empty rows

  return { headers, rows };
};

export const convertGenericToTrades = (data: { headers: string[], rows: string[][] }): (EquityTrade | FXTrade)[] => {
  const trades: (EquityTrade | FXTrade)[] = [];
  
  // Enhanced header detection for better parsing
  const hasEquityHeaders = data.headers.some(h => 
    ['orderId', 'order', 'quantity', 'qty', 'price', 'tradeValue', 'value', 'shares', 'stock'].some(field => 
      h.toLowerCase().includes(field.toLowerCase())
    )
  );
  
  const hasFXHeaders = data.headers.some(h => 
    ['currencyPair', 'currency', 'pair', 'buySell', 'buy', 'sell', 'valueDate', 'value date', 'productType', 'product', 'fx', 'foreign'].some(field => 
      h.toLowerCase().includes(field.toLowerCase())
    )
  );

  // Helper function to find column index by multiple possible names
  const findColumnIndex = (possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const index = data.headers.findIndex(h => 
        h.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  };

  // Helper function to get value with fallback
  const getValue = (row: string[], columnIndex: number, fallback: string = ''): string => {
    return columnIndex !== -1 && row[columnIndex] ? row[columnIndex] : fallback;
  };

  data.rows.forEach((row, index) => {
    if (row.length < 3) return; // Skip rows with too few columns
    
    try {
      // Generate unique IDs if not found
      const tradeIdIndex = findColumnIndex(['tradeid', 'trade id', 'id', 'reference', 'ref']);
      const tradeId = getValue(row, tradeIdIndex, `TRADE_${Date.now()}_${index + 1}`);

      if (hasEquityHeaders || (!hasFXHeaders && data.headers.length >= 10)) {
        // Create equity trade
        const trade: EquityTrade = {
          tradeId,
          orderId: getValue(row, findColumnIndex(['orderid', 'order id', 'order']), `ORDER_${index + 1}`),
          clientId: getValue(row, findColumnIndex(['clientid', 'client id', 'client', 'customer']), `CLIENT_${index + 1}`),
          tradeType: (getValue(row, findColumnIndex(['tradetype', 'type', 'side', 'buysell']), 'Buy').toLowerCase().includes('sell') ? 'Sell' : 'Buy') as 'Buy' | 'Sell',
          quantity: parseInt(getValue(row, findColumnIndex(['quantity', 'qty', 'shares', 'units']), '100')) || 100,
          price: parseFloat(getValue(row, findColumnIndex(['price', 'rate', 'cost']), '100')) || 100,
          tradeValue: parseFloat(getValue(row, findColumnIndex(['tradevalue', 'value', 'amount', 'total', 'notional']), '10000')) || 10000,
          currency: getValue(row, findColumnIndex(['currency', 'ccy', 'curr']), 'USD'),
          tradeDate: getValue(row, findColumnIndex(['tradedate', 'trade date', 'date', 'execution date']), new Date().toISOString().split('T')[0]),
          settlementDate: getValue(row, findColumnIndex(['settlementdate', 'settlement date', 'settle date', 'settlement']), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          counterparty: getValue(row, findColumnIndex(['counterparty', 'broker', 'dealer', 'bank']), 'Unknown Counterparty'),
          tradingVenue: getValue(row, findColumnIndex(['venue', 'exchange', 'market', 'trading venue']), 'NYSE'),
          traderName: getValue(row, findColumnIndex(['trader', 'tradername', 'trader name', 'sales']), 'Unknown Trader'),
          confirmationStatus: (getValue(row, findColumnIndex(['status', 'confirmation', 'confirmationstatus', 'state']), 'Pending')) as 'Confirmed' | 'Pending' | 'Failed' | 'Settled',
          countryOfTrade: getValue(row, findColumnIndex(['country', 'region', 'location']), 'US'),
          opsTeamNotes: getValue(row, findColumnIndex(['notes', 'comments', 'remarks', 'ops notes']), 'Imported from Excel/CSV')
        };
        trades.push(trade);
      } else {
        // Create FX trade
        const trade: FXTrade = {
          tradeId,
          tradeDate: getValue(row, findColumnIndex(['tradedate', 'trade date', 'date']), new Date().toISOString().split('T')[0]),
          valueDate: getValue(row, findColumnIndex(['valuedate', 'value date', 'settlement date']), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          tradeTime: getValue(row, findColumnIndex(['time', 'tradetime', 'execution time']), '10:00:00'),
          traderId: getValue(row, findColumnIndex(['trader', 'traderid', 'trader id', 'sales']), 'Unknown Trader'),
          counterparty: getValue(row, findColumnIndex(['counterparty', 'broker', 'dealer', 'bank']), 'Unknown Counterparty'),
          currencyPair: getValue(row, findColumnIndex(['currencypair', 'currency pair', 'pair', 'ccypair']), 'EUR/USD'),
          buySell: (getValue(row, findColumnIndex(['buysell', 'buy sell', 'side', 'direction']), 'Buy').toLowerCase().includes('sell') ? 'Sell' : 'Buy') as 'Buy' | 'Sell',
          dealtCurrency: getValue(row, findColumnIndex(['dealt', 'dealtcurrency', 'dealt currency']), 'EUR'),
          baseCurrency: getValue(row, findColumnIndex(['base', 'basecurrency', 'base currency']), 'EUR'),
          termCurrency: getValue(row, findColumnIndex(['term', 'termcurrency', 'term currency', 'quote']), 'USD'),
          tradeStatus: (getValue(row, findColumnIndex(['tradestatus', 'trade status', 'state']), 'Booked')) as 'Booked' | 'Confirmed' | 'Settled' | 'Cancelled',
          productType: (getValue(row, findColumnIndex(['product', 'producttype', 'product type', 'instrument']), 'Spot')) as 'Spot' | 'Forward' | 'Swap',
          maturityDate: getValue(row, findColumnIndex(['maturity', 'maturitydate', 'maturity date', 'expiry']), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          confirmationTimestamp: getValue(row, findColumnIndex(['confirmation', 'confirmationtimestamp', 'timestamp']), new Date().toISOString()),
          settlementDate: getValue(row, findColumnIndex(['settlementdate', 'settlement date', 'settle']), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          amendmentFlag: (getValue(row, findColumnIndex(['amendment', 'amendmentflag', 'amended']), 'No').toLowerCase().includes('yes') ? 'Yes' : 'No') as 'Yes' | 'No',
          confirmationMethod: (getValue(row, findColumnIndex(['method', 'confirmationmethod', 'delivery']), 'Electronic')) as 'SWIFT' | 'Email' | 'Electronic' | 'Manual',
          confirmationStatus: (getValue(row, findColumnIndex(['confirmationstatus', 'confirmation status', 'status']), 'Pending')) as 'Confirmed' | 'Pending' | 'Disputed'
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