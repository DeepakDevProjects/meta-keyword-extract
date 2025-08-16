import { google } from 'googleapis';

export class SheetsUpdater {
  private auth: any;
  private sheets: any;

  constructor(credentials: any) {
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  private parseMetaKeywords(html: string): string | null {
    const match = html.match(
      /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i
    );
    return match ? match[1] : null;
  }

  // ✅ helper for fetch with timeout using Node.js built-in fetch
  private async fetchWithTimeout(url: string, ms: number) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  async extractMetaKeywords(spreadsheetId: string): Promise<void> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A2:A',
    });

    const urls: string[] = (res.data.values || []).map((row: string[]) => row[0]);
    console.log(`Found ${urls.length} URLs`);

    const results: any[] = [];

    for (const url of urls) {
      try {
        const response = await this.fetchWithTimeout(url, 10000);
        if (!response.ok) {
          results.push(['', 'Failed', `HTTP ${response.status}`]);
          continue;
        }

        const html = await response.text();
        const keywords = this.parseMetaKeywords(html);

        if (keywords) {
          results.push([keywords, 'Success', '']);
        } else {
          results.push(['', 'No Keywords', 'Meta tag not found']);
        }
      } catch (err: any) {
        results.push(['', 'Error', err.message]);
      }
    }

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'B2:D',
      valueInputOption: 'RAW',
      requestBody: { values: results },
    });

    console.log('📊 Sheet updated with Meta Keywords data');
  }
}
