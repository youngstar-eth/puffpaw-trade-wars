#!/usr/bin/env node

/**
 * Dune Analytics Query #6622482 için veri çekme scripti
 * 
 * Kullanım:
 *   export DUNE_API_KEY="your_api_key_here"
 *   node fetch-dune-data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const QUERY_ID = '6622482';
const API_BASE = 'api.dune.com';
const LIMIT = process.env.LIMIT || 1000; // Default 1000, environment variable ile override edilebilir

if (!DUNE_API_KEY) {
  console.error('❌ DUNE_API_KEY environment variable bulunamadı!');
  console.log('\nKullanım:');
  console.log('  export DUNE_API_KEY="your_api_key_here"');
  console.log('  node fetch-dune-data.js');
  process.exit(1);
}

function fetchJSON(limit = LIMIT) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: `/api/v1/query/${QUERY_ID}/results?limit=${limit}`,
      method: 'GET',
      headers: {
        'x-dune-api-key': DUNE_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error(`JSON parse hatası: ${e.message}`));
          }
        } else {
          reject(new Error(`API hatası: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

function fetchCSV(limit = LIMIT) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      path: `/api/v1/query/${QUERY_ID}/results/csv?limit=${limit}`,
      method: 'GET',
      headers: {
        'x-dune-api-key': DUNE_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`API hatası: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function main() {
  console.log(`🔍 Dune Analytics verisi çekiliyor... (limit: ${LIMIT})\n`);

  try {
    // JSON verisi çek
    const jsonData = await fetchJSON();
    
    if (!jsonData.result || !jsonData.result.rows) {
      console.error('❌ Veri bulunamadı veya query execute edilmemiş olabilir.');
      console.log('JSON Response:', JSON.stringify(jsonData, null, 2));
      return;
    }

    const rows = jsonData.result.rows;
    const columns = jsonData.result.metadata?.column_names ||
                    (rows.length > 0 ? Object.keys(rows[0]) : []);

    // UI Skor hesaplama: Volume^0.7 × (1 + abs(PnL)/Volume)^2
    rows.forEach(row => {
      const volume = Math.abs(row.volume || 0);
      const pnl = row.pnl || 0;
      if (volume > 0) {
        row.ui_score = Math.pow(volume, 0.7) * Math.pow(1 + Math.abs(pnl) / volume, 2);
      } else {
        row.ui_score = 0;
      }
    });

    // Skora göre sırala (yüksekten düşüğe)
    rows.sort((a, b) => (b.ui_score || 0) - (a.ui_score || 0));
    rows.forEach((row, idx) => { row.ui_rank = idx + 1; });

    console.log('✅ Veri başarıyla çekildi! (UI skorları hesaplandı)\n');
    console.log('📊 Veri Yapısı:');
    console.log(`   Toplam satır: ${rows.length}`);
    console.log(`   Kolonlar (${columns.length}):`);
    columns.forEach((col, i) => {
      console.log(`   ${i + 1}. ${col}`);
    });

    console.log('\n📋 İlk 5 Satır Preview:');
    console.log('─'.repeat(80));
    rows.slice(0, 5).forEach((row, idx) => {
      console.log(`\nSatır ${idx + 1}:`);
      columns.forEach(col => {
        const value = row[col];
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        console.log(`  ${col}: ${displayValue}`);
      });
    });
    console.log('─'.repeat(80));

    // JSON dosyasına kaydet
    const jsonPath = path.join(__dirname, 'dune-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`\n💾 JSON kaydedildi: ${jsonPath}`);

    // CSV verisi çek ve kaydet
    try {
      const csvData = await fetchCSV();
      const csvPath = path.join(__dirname, 'dune-data.csv');
      fs.writeFileSync(csvPath, csvData);
      console.log(`💾 CSV kaydedildi: ${csvPath}`);
    } catch (csvError) {
      console.warn(`⚠️  CSV çekilemedi: ${csvError.message}`);
    }

    console.log('\n✨ Tamamlandı!');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    if (error.message.includes('401')) {
      console.log('\n💡 API key\'inizi kontrol edin:');
      console.log('   export DUNE_API_KEY="your_api_key_here"');
    }
    process.exit(1);
  }
}

main();
