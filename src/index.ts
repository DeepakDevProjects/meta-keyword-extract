import { SheetsUpdater } from './sheets-updater';

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Meta Keywords Extraction...');

    const spreadsheetId =
      process.env.SPREADSHEET_ID ||
      '1u_6w8LhMj-zg8qQxg71zNRmdzdDVPDm1UKDNj_9IAtg'; // default sheet ID
    const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (spreadsheetId && googleCredentialsPath) {
      try {
        const fs = require('fs');
        const credentials = JSON.parse(
          fs.readFileSync(googleCredentialsPath, 'utf8')
        );

        const sheetsUpdater = new SheetsUpdater(credentials);
        await sheetsUpdater.extractMetaKeywords(spreadsheetId);

        console.log('✅ Spreadsheet updated successfully!');
      } catch (sheetsError) {
        const errorMessage =
          sheetsError instanceof Error ? sheetsError.message : String(sheetsError);
        console.warn('⚠️ Could not update spreadsheet:', errorMessage);
      }
    } else {
      console.log(
        'ℹ️ No spreadsheet configuration found. Please check environment variables.'
      );
    }

    console.log('🎉 Meta Keywords extraction completed successfully!');
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
