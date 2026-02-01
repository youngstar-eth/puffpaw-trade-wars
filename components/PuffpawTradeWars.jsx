'use client';

import { useState, useEffect, useCallback } from 'react';
import PolymarketWidget from './PolymarketWidget';

const PuffpawTradeWars = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit] = useState(1000);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);
  
  // Polymarket stats for hero section
  const [polymarketStats, setPolymarketStats] = useState({
    totalVolume: 0,
    totalTraders: 0,
  });
  
  // Dune stats (from query)
  const [duneStats, setDuneStats] = useState({
    totalTraders: 0,
    totalHolders: 0,
  });
  
  // Auto-refresh interval: 10 minutes (600000 ms)
  const REFRESH_INTERVAL = 600000;

  // Puffpaw brand colors
  const colors = {
    primary: '#E84142',      // Puffpaw red
    primaryDark: '#c73536',
    background: '#1a1a1a',
    backgroundDark: '#0d0d0d',
    surface: '#242424',
    surfaceLight: '#2d2d2d',
    text: '#ffffff',
    textMuted: '#9ca3af',
    gold: '#fbbf24',
    silver: '#d1d5db',
    bronze: '#d97706',
    success: '#22c55e',
    error: '#ef4444',
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: colors.backgroundDark,
      color: colors.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    },
    header: {
      background: colors.background,
      borderBottom: `1px solid ${colors.surface}`,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    logoImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: colors.text,
      letterSpacing: '-0.5px',
    },
    content: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '32px 24px',
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '48px',
      padding: '40px 20px',
      background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.backgroundDark} 100%)`,
      borderRadius: '16px',
      border: `1px solid ${colors.surfaceLight}`,
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: 800,
      color: colors.text,
      marginBottom: '12px',
      letterSpacing: '-1px',
    },
    titleAccent: {
      color: colors.primary,
    },
    subtitle: {
      fontSize: '1.1rem',
      color: colors.textMuted,
      fontWeight: 400,
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    statsBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '32px',
      marginTop: '32px',
      flexWrap: 'wrap',
    },
    statItem: {
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: colors.primary,
    },
    statLabel: {
      fontSize: '0.85rem',
      color: colors.textMuted,
      marginTop: '4px',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '16px 20px',
      background: colors.surface,
      borderRadius: '12px',
      border: `1px solid ${colors.surfaceLight}`,
    },
    recordCount: {
      fontSize: '0.95rem',
      color: colors.textMuted,
    },
    recordCountNumber: {
      color: colors.text,
      fontWeight: 600,
    },
    button: {
      padding: '10px 20px',
      background: colors.primary,
      border: 'none',
      borderRadius: '8px',
      color: colors.text,
      fontSize: '0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tableContainer: {
      background: colors.surface,
      borderRadius: '12px',
      overflow: 'auto',
      border: `1px solid ${colors.surfaceLight}`,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1200px',
    },
    th: {
      padding: '14px 12px',
      textAlign: 'left',
      background: colors.surfaceLight,
      color: colors.textMuted,
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `1px solid ${colors.surface}`,
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0,
    },
    td: {
      padding: '12px',
      borderBottom: `1px solid ${colors.surfaceLight}`,
      fontSize: '0.875rem',
      whiteSpace: 'nowrap',
      color: colors.text,
    },
    tr: {
      transition: 'background 0.15s ease',
    },
    rank1: {
      background: 'rgba(251, 191, 36, 0.1)',
      borderLeft: `3px solid ${colors.gold}`,
    },
    rank2: {
      background: 'rgba(209, 213, 219, 0.08)',
      borderLeft: `3px solid ${colors.silver}`,
    },
    rank3: {
      background: 'rgba(217, 119, 6, 0.1)',
      borderLeft: `3px solid ${colors.bronze}`,
    },
    loading: {
      textAlign: 'center',
      padding: '80px 20px',
    },
    loadingSpinner: {
      width: '48px',
      height: '48px',
      border: `3px solid ${colors.surfaceLight}`,
      borderTop: `3px solid ${colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px',
    },
    loadingText: {
      fontSize: '1rem',
      color: colors.textMuted,
    },
    error: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${colors.error}`,
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      margin: '20px 0',
    },
    errorText: {
      color: colors.error,
      marginBottom: '16px',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: 700,
      marginRight: '8px',
    },
    badgeGold: {
      background: 'rgba(251, 191, 36, 0.2)',
      color: colors.gold,
    },
    badgeSilver: {
      background: 'rgba(209, 213, 219, 0.2)',
      color: colors.silver,
    },
    badgeBronze: {
      background: 'rgba(217, 119, 6, 0.2)',
      color: colors.bronze,
    },
    positiveValue: {
      color: colors.success,
    },
    negativeValue: {
      color: colors.error,
    },
    footer: {
      textAlign: 'center',
      padding: '32px 24px',
      borderTop: `1px solid ${colors.surface}`,
      marginTop: '48px',
      color: colors.textMuted,
      fontSize: '0.85rem',
    },
    footerLink: {
      color: colors.primary,
      textDecoration: 'none',
    },
  };

  const formatValue = (value, columnName) => {
    if (value === null || value === undefined) return '-';
    
    const lowerCol = columnName.toLowerCase();
    
    // Token formatting (reward_amount)
    if (lowerCol === 'reward_amount') {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value) + ' PUFF';
      }
    }

    // USD formatting (valuation rewards)
    if (lowerCol.includes('reward @')) {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      }
    }

    // USD formatting (volume, pnl, etc.)
    if (lowerCol.includes('volume') || lowerCol.includes('usd') || lowerCol.includes('value')) {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      }
    }
    
    // PNL formatting with color indicator
    if (lowerCol.includes('pnl')) {
      if (typeof value === 'number') {
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
        return { value: formatted, isPositive: value >= 0 };
      }
    }
    
    // Final score formatting - 2 decimal places
    if (lowerCol.includes('final_score') || lowerCol.includes('score')) {
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      }
    }
    
    // Large number formatting
    if (typeof value === 'number' && Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    }
    
    // Address/wallet/trader formatting - mask
    if (lowerCol.includes('wallet') || lowerCol.includes('address') || lowerCol.includes('trader')) {
      if (typeof value === 'string' && value.length > 10) {
        return `${value.slice(0, 6)}...${value.slice(-4)}`;
      }
    }
    
    return value;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dune?limit=${limit}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const json = await response.json();
      
      if (!json.result || !json.result.rows || json.result.rows.length === 0) {
        throw new Error('No data found. The query may need to be executed first.');
      }

      const rows = json.result.rows;
      const cols = json.result.metadata?.column_names || 
                   (rows.length > 0 ? Object.keys(rows[0]) : []);

      // Fetch signer data to replace trader addresses
      let signerMap = {};
      try {
        const signerRes = await fetch('/leaderboard_data.json');
        if (signerRes.ok) {
          const signerData = await signerRes.json();
          signerData.forEach(item => {
            if (item.address && item.signer) {
              signerMap[item.address.toLowerCase()] = item.signer;
            }
          });
        }
      } catch (e) {
        console.log('Signer data not available, using proxy addresses');
      }

      // Add valuation columns (starting from 200M)
      const valuationColumns = [
        { name: 'Reward @ 200M', multiplier: 0.002 },
        { name: 'Reward @ 300M', multiplier: 0.003 },
        { name: 'Reward @ 400M', multiplier: 0.004 },
        { name: 'Reward @ 500M', multiplier: 0.005 },
      ];

      // Calculate valuation rewards and replace trader with signer
      const enrichedRows = rows.map(row => {
        const enrichedRow = { ...row };
        const rewardAmount = row.reward_amount || 0;
        
        // Replace trader address with signer address if available
        if (row.trader && signerMap[row.trader.toLowerCase()]) {
          enrichedRow.trader = signerMap[row.trader.toLowerCase()];
        }
        
        valuationColumns.forEach(({ name, multiplier }) => {
          enrichedRow[name] = rewardAmount * multiplier;
        });
        
        return enrichedRow;
      });

      // Add columns after reward_amount
      const rewardIndex = cols.indexOf('reward_amount');
      const newCols = [...cols];
      if (rewardIndex !== -1) {
        const valuationNames = valuationColumns.map(({ name }) => name);
        newCols.splice(rewardIndex + 1, 0, ...valuationNames);
      } else {
        valuationColumns.forEach(({ name }) => {
          newCols.push(name);
        });
      }

      // Filter out meta columns from display
      const displayCols = newCols.filter(col => !col.startsWith('_'));
      setColumns(displayCols);
      setData(enrichedRows);
      
      // Extract Dune stats from first row (meta columns)
      if (rows.length > 0) {
        setDuneStats({
          totalTraders: rows[0]._total_traders || 0,
          totalHolders: rows[0]._total_holders || 0,
        });
      }
      
      // Update timestamps
      const now = new Date();
      setLastUpdated(now);
      setNextUpdate(new Date(now.getTime() + REFRESH_INTERVAL));
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [limit, REFRESH_INTERVAL]);

  // Fetch Polymarket stats for hero section
  const fetchPolymarketStats = useCallback(async () => {
    try {
      const res = await fetch('/api/polymarket');
      if (res.ok) {
        const data = await res.json();
        setPolymarketStats({
          totalVolume: data.totalVolume || 0,
          totalTraders: data.totalTraders || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching Polymarket stats:', err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();
    fetchPolymarketStats();
    
    // Set up auto-refresh every hour
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchData();
      fetchPolymarketStats();
    }, REFRESH_INTERVAL);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchData, fetchPolymarketStats]);

  const getRowStyle = (index) => {
    const baseStyle = { ...styles.tr };
    if (index === 0) return { ...baseStyle, ...styles.rank1 };
    if (index === 1) return { ...baseStyle, ...styles.rank2 };
    if (index === 2) return { ...baseStyle, ...styles.rank3 };
    return baseStyle;
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span style={{...styles.badge, ...styles.badgeGold}}>1</span>;
    if (index === 1) return <span style={{...styles.badge, ...styles.badgeSilver}}>2</span>;
    if (index === 2) return <span style={{...styles.badge, ...styles.badgeBronze}}>3</span>;
    return null;
  };

  const formatColumnName = (col) => {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderCellValue = (row, col) => {
    const formatted = formatValue(row[col], col);
    
    // Handle PNL with color
    if (typeof formatted === 'object' && formatted.value) {
      return (
        <span style={formatted.isPositive ? styles.positiveValue : styles.negativeValue}>
          {formatted.value}
        </span>
      );
    }
    
    return formatted;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <img src="/puffpaw-logo.png" alt="Puffpaw" style={styles.logoImage} />
          </div>
          <span style={styles.logoText}>Puffpaw</span>
        </div>
        <a 
          href="https://whitepaper.puffpaw.xyz/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{...styles.button, background: 'transparent', border: `1px solid ${colors.surfaceLight}`}}
        >
          Whitepaper ↗
        </a>
      </header>

      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <h1 style={styles.title}>
            <span style={styles.titleAccent}>Paws vs Claws</span> Leaderboard
          </h1>
          <p style={styles.subtitle}>
            Who will discover the true price first? Human intuition or Machine precision?
          </p>
          
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {duneStats.totalTraders.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Total Traders</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {polymarketStats.totalTraders.toLocaleString()}
              </div>
              <div style={styles.statLabel}>Current Holders</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                ${polymarketStats.totalVolume >= 1000000 
                  ? (polymarketStats.totalVolume / 1000000).toFixed(2) + 'M'
                  : (polymarketStats.totalVolume / 1000).toFixed(0) + 'K'
                }
              </div>
              <div style={styles.statLabel}>Total Volume</div>
            </div>
          </div>
        </div>

        {/* Polymarket Widget - At the top */}
        <PolymarketWidget />

        {/* Error State */}
        {error && (
          <div style={styles.error}>
            <div style={styles.errorText}>
              <strong>Error:</strong> {error}
            </div>
            <button onClick={fetchData} style={styles.button}>
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={styles.loading}>
            <div style={styles.loadingSpinner} />
            <div style={styles.loadingText}>Loading leaderboard data...</div>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && data.length > 0 && (
          <>
            <div style={styles.toolbar}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                <div style={styles.recordCount}>
                  Showing <span style={styles.recordCountNumber}>{data.length}</span> traders
                </div>
                {lastUpdated && (
                  <div style={{fontSize: '0.8rem', color: colors.textMuted}}>
                    Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh in {nextUpdate ? Math.max(0, Math.ceil((nextUpdate - new Date()) / 60000)) : 10} min
                  </div>
                )}
              </div>
              <button onClick={fetchData} style={styles.button}>
                ↻ Refresh
              </button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} style={styles.th}>
                        {formatColumnName(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIdx) => (
                    <tr 
                      key={rowIdx} 
                      style={getRowStyle(rowIdx)}
                      onMouseEnter={(e) => {
                        if (rowIdx > 2) {
                          e.currentTarget.style.background = colors.surfaceLight;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (rowIdx > 2) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} style={styles.td}>
                          {colIdx === 0 && getRankBadge(rowIdx)}
                          {renderCellValue(row, col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && data.length === 0 && (
          <div style={styles.loading}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
            <div style={styles.loadingText}>No data found</div>
            <button onClick={fetchData} style={{...styles.button, marginTop: '20px'}}>
              Try Again
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>
          Powered by{' '}
          <a href="https://puffpaw.xyz" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
            Puffpaw
          </a>
          {' '}• Data from{' '}
          <a href="https://dune.com" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
            Dune Analytics
          </a>
          {' '}•{' '}
          <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
            Polymarket
          </a>
        </p>
      </footer>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        a:hover {
          opacity: 0.8;
        }
        ::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${colors.surface};
        }
        ::-webkit-scrollbar-thumb {
          background: ${colors.surfaceLight};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.textMuted};
        }
      `}</style>
    </div>
  );
};

export default PuffpawTradeWars;
