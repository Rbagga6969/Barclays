import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { storage } from './storage';
import { type InsertEquityTrade, type InsertFxTrade } from '@shared/schema';

async function enhancedMigration() {
  console.log('Starting enhanced data migration with 400 trades total...');

  try {
    // Read and parse equity trades CSV - limit to first 200 trades
    const equityData = readFileSync('client/public/data/equity_trade_lifecycle_dataset.csv', 'utf-8');
    const allEquityRecords = parse(equityData, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });

    // Take only first 200 equity trades
    const equityRecords = allEquityRecords.slice(0, 200);
    console.log(`Processing ${equityRecords.length} equity trades (reduced from ${allEquityRecords.length})`);

    // Migrate equity trades with all details
    for (const record of equityRecords) {
      if (!record['Trade ID']) continue;
      
      const equityTrade: InsertEquityTrade = {
        tradeId: record['Trade ID'],
        orderId: record['Order ID'] || '',
        clientId: record['Client ID'] || '',
        security: record['Security'] || record['Trade Type'] || 'EQUITY',
        side: record['Trade Type'] || record['Side'] || 'Buy',
        quantity: parseInt(record['Quantity'] || '0'),
        price: parseFloat(record['Price'] || '0'),
        tradeValue: parseFloat(record['Trade Value'] || '0'),
        currency: record['Currency'] || 'USD',
        counterparty: record['Counterparty'] || 'Unknown',
        tradingVenue: record['Trading Venue'] || '',
        trader: record['Trader Name'] || record['Trader'] || 'Unknown',
        tradeDate: record['Trade Date'] || '2025-01-01',
        settlementDate: record['Settlement Date'] || '2025-01-03',
        tradeTime: record['Trade Time'] || '09:00:00',
        confirmationStatus: record['Confirmation Status'] || 'Pending',
        countryOfTrade: record['Country of Trade'] || '',
        opsTeamNotes: record['Ops Team Notes'] || ''
      };

      try {
        await storage.createEquityTrade(equityTrade);
      } catch (error) {
        console.error(`Error migrating equity trade ${equityTrade.tradeId}:`, error);
      }
    }

    // Read and parse FX trades CSV - limit to first 200 trades
    const fxData = readFileSync('client/public/data/fx_trade_lifecycle_full_dataset.csv', 'utf-8');
    const allFxRecords = parse(fxData, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });

    // Take only first 200 FX trades
    const fxRecords = allFxRecords.slice(0, 200);
    console.log(`Processing ${fxRecords.length} FX trades (reduced from ${allFxRecords.length})`);

    // Migrate FX trades with all details
    for (const record of fxRecords) {
      if (!record['TradeID']) continue;
      
      const fxTrade: InsertFxTrade = {
        tradeId: record['TradeID'],
        currencyPair: record['CurrencyPair'] || 'USD/EUR',
        transactionType: record['BuySell'] || 'Buy',
        baseCurrency: record['BaseCurrency'] || 'USD',
        quoteCurrency: record['TermCurrency'] || 'EUR',
        termCurrency: record['TermCurrency'] || 'EUR',
        dealtCurrency: record['DealtCurrency'] || '',
        counterparty: record['Counterparty'] || 'Unknown',
        traderId: record['TraderID'] || '',
        tradeDate: record['TradeDate'] || '2025-01-01',
        valueDate: record['ValueDate'] || '2025-01-03',
        settlementDate: record['SettlementDate'] || record['ValueDate'] || '2025-01-03',
        tradeTime: record['TradeTime'] || '09:00:00',
        tradeStatus: record['TradeStatus'] || 'Active',
        productType: record['ProductType'] || 'Spot',
        maturityDate: record['MaturityDate'] || '',
        confirmationTimestamp: record['ConfirmationTimestamp'] || '',
        amendmentFlag: record['AmendmentFlag'] || 'No',
        confirmationMethod: record['ConfirmationMethod'] || 'Manual',
        confirmationStatus: record['ConfirmationStatus'] || 'Pending'
      };

      try {
        await storage.createFxTrade(fxTrade);
      } catch (error) {
        console.error(`Error migrating FX trade ${fxTrade.tradeId}:`, error);
      }
    }

    console.log('Enhanced data migration completed successfully!');
    console.log(`Total trades migrated: ${equityRecords.length + fxRecords.length} (200 equity + 200 FX)`);
  } catch (error) {
    console.error('Error during enhanced data migration:', error);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enhancedMigration().then(() => {
    console.log('Enhanced migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Enhanced migration failed:', error);
    process.exit(1);
  });
}

export { enhancedMigration };