import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { storage } from './storage';
import { type InsertEquityTrade, type InsertFxTrade } from '@shared/schema';

async function migrateData() {
  console.log('Starting data migration...');

  try {
    // Read and parse equity trades CSV
    const equityData = readFileSync('client/public/data/equity_trade_lifecycle_dataset.csv', 'utf-8');
    const equityRecords = parse(equityData, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });

    console.log(`Found ${equityRecords.length} equity trades - skipping as already migrated`);

    // Skip equity trades migration as they're already loaded

    // Read and parse FX trades CSV
    const fxData = readFileSync('client/public/data/fx_trade_lifecycle_full_dataset.csv', 'utf-8');
    const fxRecords = parse(fxData, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true
    });

    console.log(`Found ${fxRecords.length} FX trades to migrate`);

    // Migrate FX trades
    for (const record of fxRecords) {
      // Skip records with missing essential data
      if (!record['TradeID']) continue;
      
      const fxTrade: InsertFxTrade = {
        tradeId: record['TradeID'],
        currencyPair: record['CurrencyPair'] || 'USD/EUR',
        transactionType: record['BuySell'] || 'Buy',
        baseCurrency: record['BaseCurrency'] || 'USD',
        quoteCurrency: record['TermCurrency'] || 'EUR',
        termCurrency: record['TermCurrency'] || 'EUR',
        counterparty: record['Counterparty'] || 'Unknown',
        tradeDate: record['TradeDate'] || '2025-01-01',
        settlementDate: record['ValueDate'] || '2025-01-03',
        tradeTime: record['TradeTime'] || '09:00:00',
        confirmationStatus: record['ConfirmationStatus'] || 'Pending'
      };

      try {
        await storage.createFxTrade(fxTrade);
      } catch (error) {
        console.error(`Error migrating FX trade ${fxTrade.tradeId}:`, error);
      }
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during data migration:', error);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { migrateData };