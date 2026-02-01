import json
import time
import os
from web3 import Web3
from dune_client.client import DuneClient

# --- AYARLAR ---
DUNE_QUERY_ID = 6622482
DUNE_API_KEY = os.environ.get("DUNE_API_KEY")
RPC_URL = os.environ.get("RPC_URL", "https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY")

if not DUNE_API_KEY:
    raise ValueError("DUNE_API_KEY environment variable is required")

# Çıktı Dosyasının Yeri (Next.js/Vercel için 'public' klasörü standarttır)
OUTPUT_FILE = "public/leaderboard_data.json"

w3 = Web3(Web3.HTTPProvider(RPC_URL))
SAFE_ABI = [{"constant":True,"inputs":[],"name":"getOwners","outputs":[{"name":"","type":"address[]"}],"type":"function"}]

def find_signer(proxy_address):
    """Proxy cüzdan adresinden gerçek signer adresini bulur."""
    try:
        if not proxy_address: return None
        addr = Web3.to_checksum_address(proxy_address)
        code = w3.eth.get_code(addr)
        if not code or len(code) < 10: return proxy_address # EOA ise kendisi signer'dır
        
        # Gnosis Safe Kontrolü
        try:
            contract = w3.eth.contract(address=addr, abi=SAFE_ABI)
            owners = contract.functions.getOwners().call()
            if owners: return owners[0] # İlk owner'ı signer olarak al
        except: pass
        return proxy_address # Bulamazsa proxy adresini döndür
    except:
        return proxy_address

def main():
    print("🚀 Veriler Dune'dan çekiliyor...")
    dune = DuneClient(DUNE_API_KEY)
    # API'den en son sonucu alıyoruz
    wallets = dune.get_latest_result(DUNE_QUERY_ID).result.rows

    export_data = []
    print(f"🔍 {len(wallets)} cüzdan için Signer kontrolü yapılıyor...")

    for i, row in enumerate(wallets):
        proxy = row.get('trader')
        signer = find_signer(proxy)
        
        export_data.append({
            "rank": row.get('rank_num'),
            "address": proxy,
            "signer": signer, # Ödül claim edecek asıl cüzdan burası
            "volume": row.get('total_volume', 0),
            "pnl": row.get('net_pnl_usd', 0), # Dashboard'da gösterdiğimiz total PnL
            "score": row.get('final_score', 0),
            "reward": row.get('reward_amount', 0)
        })
        
        # İlerleme çubuğu
        if (i + 1) % 10 == 0: 
            print(f"   ⏳ {i + 1} işlendi...")
        time.sleep(0.05) 

    # Klasör kontrolü (Eğer public klasörü yoksa oluşturur)
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=4)

    print(f"\n✅ BAŞARILI! '{OUTPUT_FILE}' dosyası güncellendi.")
    print(f"   📊 Toplam {len(export_data)} trader kaydedildi.")
    print("👉 Şimdi: git add . && git commit -m 'Update data' && git push")

if __name__ == "__main__":
    main()

