import json
import os
import sys
from dune_client.client import DuneClient

# --- AYARLAR ---
DUNE_QUERY_ID = 6622482
DUNE_API_KEY = os.environ.get("DUNE_API_KEY")

if not DUNE_API_KEY:
    print("❌ ERROR: DUNE_API_KEY environment variable is required")
    sys.exit(1)

# Çıktı Dosyasının Yeri
OUTPUT_FILE = "public/leaderboard_data.json"

def main():
    print("🚀 Veriler Dune'dan çekiliyor...")
    
    try:
        dune = DuneClient(DUNE_API_KEY)
        result = dune.get_latest_result(DUNE_QUERY_ID)
        
        if not result or not result.result or not result.result.rows:
            print("❌ ERROR: No data returned from Dune query")
            sys.exit(1)
            
        wallets = result.result.rows
        print(f"✅ {len(wallets)} cüzdan verisi alındı")
        
        # Debug: İlk satırın yapısını göster
        if wallets:
            print(f"📋 Örnek veri yapısı: {list(wallets[0].keys())}")
        
        export_data = []
        
        for row in wallets:
            # Dune query'den gelen kolonları al
            trader = row.get('trader', '')
            
            export_data.append({
                "rank": row.get('rank_num', 0),
                "address": trader,
                "signer": trader,  # Şimdilik aynı, RPC olmadan signer bulamıyoruz
                "volume": float(row.get('total_volume', 0) or 0),
                "pnl": float(row.get('net_pnl_usd', 0) or 0),
                "score": float(row.get('final_score', 0) or 0),
                "reward": float(row.get('reward_amount', 0) or 0)
            })

        # Klasör kontrolü
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2)

        print(f"\n✅ BAŞARILI! '{OUTPUT_FILE}' dosyası güncellendi.")
        print(f"   📊 Toplam {len(export_data)} trader kaydedildi.")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
