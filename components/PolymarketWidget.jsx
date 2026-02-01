'use client';

import { useEffect, useState } from 'react';

const EVENT_SLUG = 'puffpaw-fdv-above-one-day-after-launch';

// Puffpaw brand colors
const colors = {
  primary: '#E84142',
  primaryDark: '#c73536',
  background: '#1a1a1a',
  backgroundDark: '#0d0d0d',
  surface: '#242424',
  surfaceLight: '#2d2d2d',
  text: '#ffffff',
  textMuted: '#9ca3af',
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.15)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  info: '#38bdf8',
};

function PolymarketWidget() {
  const [markets, setMarkets] = useState([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalTraders, setTotalTraders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/polymarket');
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `API Error: ${res.status}`);
        }
        
        const data = await res.json();
        
        setMarkets(data.markets || []);
        setTotalVolume(data.totalVolume || 0);
        setTotalTraders(data.totalTraders || 0);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner} />
          <div>Loading Polymarket data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span style={styles.titleAccent}>FDV Prediction</span> Market
        </h2>
        <a 
          href={`https://polymarket.com/event/${EVENT_SLUG}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.polymarketLink}
        >
          View on Polymarket ↗
        </a>
      </div>
      
      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          Total Volume: <strong style={{color: colors.primary}}>${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
        </div>
        <div style={styles.statItem}>
          Total Holders: <strong style={{color: colors.info}}>{totalTraders.toLocaleString()}</strong>
        </div>
      </div>

      <div style={styles.grid}>
        {markets.map((m) => {
          const prices = JSON.parse(m.outcomePrices || '[]');
          const yesPrice = (Number(prices[0]) * 100).toFixed(1);
          const noPrice = (Number(prices[1]) * 100).toFixed(1);
          const probability = (Number(prices[0]) * 100).toFixed(0);
          const vol = Number(m.volume || 0);

          return (
            <div key={m.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.marketLabel}>{m.groupItemTitle}</span>
                <span style={{
                  ...styles.probability,
                  color: probability >= 50 ? colors.success : colors.error
                }}>
                  {probability}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${probability}%`,
                  background: probability >= 50 
                    ? `linear-gradient(90deg, ${colors.success}, #4ade80)` 
                    : `linear-gradient(90deg, ${colors.error}, #f87171)`
                }} />
              </div>

              {/* Prices */}
              <div style={styles.priceRow}>
                <span style={styles.yesPrice}>Yes: {yesPrice}¢</span>
                <span style={styles.noPrice}>No: {noPrice}¢</span>
              </div>

              {/* Volume & Traders */}
              <div style={styles.volumeRow}>
                <span>Volume: ${vol.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span>
                  <strong style={{color: colors.info}}>{m.totalTraders || 0}</strong> traders
                  <span style={{color: colors.textMuted, marginLeft: '8px'}}>
                    (Yes: {m.yesTraders || 0} · No: {m.noTraders || 0})
                  </span>
                </span>
              </div>

              {/* Top Holders */}
              {(m.topYes?.length > 0 || m.topNo?.length > 0) && (
                <div style={styles.holdersSection}>
                  <div style={styles.holderColumn}>
                    <div style={{...styles.holderTitle, color: colors.success}}>
                      Top Yes Holders
                    </div>
                    {m.topYes?.length === 0 ? (
                      <div style={styles.noHolders}>No holders yet</div>
                    ) : (
                      m.topYes?.map((h, i) => (
                        <div key={i} style={styles.holderRow}>
                          <span style={styles.holderName}>
                            {h.name || h.pseudonym || `${h.proxyWallet?.slice(0, 8)}...`}
                          </span>
                          <span style={styles.shares}>
                            {Math.round(h.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={styles.holderColumn}>
                    <div style={{...styles.holderTitle, color: colors.error}}>
                      Top No Holders
                    </div>
                    {m.topNo?.length === 0 ? (
                      <div style={styles.noHolders}>No holders yet</div>
                    ) : (
                      m.topNo?.map((h, i) => (
                        <div key={i} style={styles.holderRow}>
                          <span style={styles.holderName}>
                            {h.name || h.pseudonym || `${h.proxyWallet?.slice(0, 8)}...`}
                          </span>
                          <span style={styles.shares}>
                            {Math.round(h.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: colors.surface,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${colors.surfaceLight}`,
    marginTop: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text,
    margin: 0,
  },
  titleAccent: {
    color: colors.primary,
  },
  polymarketLink: {
    fontSize: '0.9rem',
    color: colors.textMuted,
    textDecoration: 'none',
    padding: '8px 16px',
    border: `1px solid ${colors.surfaceLight}`,
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  statsRow: {
    display: 'flex',
    gap: '24px',
    fontSize: '1rem',
    color: colors.textMuted,
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    gap: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '16px',
  },
  card: {
    background: colors.backgroundDark,
    borderRadius: '12px',
    padding: '20px',
    border: `1px solid ${colors.surfaceLight}`,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  marketLabel: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.text,
  },
  probability: {
    fontSize: '1.75rem',
    fontWeight: 800,
  },
  progressBar: {
    height: '6px',
    background: colors.surfaceLight,
    borderRadius: '3px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },
  yesPrice: {
    background: colors.successBg,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: colors.success,
    fontWeight: 600,
    flex: 1,
    textAlign: 'center',
  },
  noPrice: {
    background: colors.errorBg,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: colors.error,
    fontWeight: 600,
    flex: 1,
    textAlign: 'center',
  },
  volumeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: colors.textMuted,
    marginBottom: '12px',
  },
  holdersSection: {
    display: 'flex',
    gap: '16px',
    borderTop: `1px solid ${colors.surfaceLight}`,
    paddingTop: '12px',
  },
  holderColumn: {
    flex: 1,
    minWidth: 0,
  },
  holderTitle: {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  holderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    padding: '3px 0',
    color: colors.textMuted,
  },
  holderName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '120px',
  },
  shares: {
    fontWeight: 600,
    color: colors.text,
  },
  noHolders: {
    fontSize: '0.75rem',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: colors.textMuted,
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: `3px solid ${colors.surfaceLight}`,
    borderTop: `3px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: colors.error,
    background: colors.errorBg,
    borderRadius: '8px',
  },
};

export default PolymarketWidget;
