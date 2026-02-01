import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';
const DATA_API = 'https://data-api.polymarket.com';
const SLUG = 'puffpaw-fdv-above-one-day-after-launch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch market data
    const res = await fetch(`${GAMMA_API}/events?slug=${SLUG}`);
    
    if (!res.ok) {
      throw new Error(`Gamma API error: ${res.status}`);
    }
    
    const data = await res.json();
    const rawMarkets = data[0]?.markets || [];

    // 2. Fetch trader data for each market
    const allUniqueTraders = new Set();
    
    const enriched = await Promise.all(
      rawMarkets.map(async (m) => {
        try {
          const hRes = await fetch(
            `${DATA_API}/holders?market=${m.conditionId}&limit=1000&offset=0`
          );
          
          if (!hRes.ok) {
            return {
              ...m,
              yesTraders: 0,
              noTraders: 0,
              totalTraders: 0,
              topYes: [],
              topNo: [],
            };
          }
          
          const hData = await hRes.json();
          
          // hData is an array with 2 elements: [yesHolders, noHolders]
          const yesData = hData[0]?.holders || [];
          const noData = hData[1]?.holders || [];
          
          // Count unique traders for this market
          const marketTraders = new Set();
          yesData.forEach(h => {
            marketTraders.add(h.proxyWallet);
            allUniqueTraders.add(h.proxyWallet);
          });
          noData.forEach(h => {
            marketTraders.add(h.proxyWallet);
            allUniqueTraders.add(h.proxyWallet);
          });
          
          return {
            ...m,
            yesTraders: yesData.length,
            noTraders: noData.length,
            totalTraders: marketTraders.size,
            topYes: yesData.slice(0, 5).map(h => ({
              name: h.name || h.pseudonym || null,
              proxyWallet: h.proxyWallet,
              amount: h.amount,
            })),
            topNo: noData.slice(0, 5).map(h => ({
              name: h.name || h.pseudonym || null,
              proxyWallet: h.proxyWallet,
              amount: h.amount,
            })),
          };
        } catch (e) {
          console.error(`Error fetching holders for market ${m.id}:`, e);
          return {
            ...m,
            yesTraders: 0,
            noTraders: 0,
            totalTraders: 0,
            topYes: [],
            topNo: [],
          };
        }
      })
    );

    // Sort: 50M → 300M
    enriched.sort((a, b) =>
      Number(a.groupItemTitle?.replace(/\D/g, '') || 0) -
      Number(b.groupItemTitle?.replace(/\D/g, '') || 0)
    );

    // Calculate totals
    const totalVolume = enriched.reduce((s, m) => s + Number(m.volume || 0), 0);

    return NextResponse.json({
      markets: enriched,
      totalVolume,
      totalTraders: allUniqueTraders.size,
      _meta: {
        fetchedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Polymarket data' },
      { status: 500 }
    );
  }
}
