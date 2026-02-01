'use client';

import { useState, useEffect, useCallback } from 'react';
import PolymarketWidget from './PolymarketWidget';

// Signer data map: address -> { signer, isClaw }
// If signer === address, it's a Claw (bot/agent) because humans use proxy wallets via Polymarket UI

const PuffpawTradeWars = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit] = useState(1000);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);
  
  // Signer data for faction detection
  const [signerData, setSignerData] = useState({});
  
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

  // Faction stats (calculated from signer data)
  const [factionStats, setFactionStats] = useState({
    pawsCount: 0,
    clawsCount: 0,
    pawsVolume: 0,
    clawsVolume: 0,
    pawsPercent: 50,
    clawsPercent: 50,
  });
  
  // Auto-refresh interval: 10 minutes (600000 ms)
  const REFRESH_INTERVAL = 600000;

  // Puffpaw brand colors + Faction colors
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
    // Faction colors
    pawGreen: '#22c55e',
    pawAmber: '#f59e0b',
    clawPurple: '#a855f7',
    clawCyan: '#06b6d4',
  };

  // Check if an address is a Claw (bot/agent)
  // A Claw is identified when signer === address (no proxy wallet = direct trading = bot)
  const isClaw = (address) => {
    if (!address) return false;
    const lowerAddress = address.toLowerCase();
    const data = signerData[lowerAddress];
    if (!data) return false;
    // If signer equals address, it's a Claw (bot/agent)
    return data.signer.toLowerCase() === lowerAddress;
  };

  // Get faction for a trader
  const getFaction = (address) => {
    return isClaw(address) ? 'claw' : 'paw';
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
    content: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '32px 24px',
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '32px',
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
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: 1.6,
    },
    statsBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginTop: '32px',
      flexWrap: 'wrap',
    },
    statItem: {
      textAlign: 'center',
      minWidth: '80px',
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
    // Faction Battle Bar styles
    battleBarContainer: {
      marginBottom: '32px',
      padding: '24px',
      background: colors.surface,
      borderRadius: '16px',
      border: `1px solid ${colors.surfaceLight}`,
    },
    battleBarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    factionSide: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    factionName: {
      fontSize: '1.25rem',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    factionStats: {
      fontSize: '0.85rem',
      color: colors.textMuted,
    },
    vsText: {
      fontSize: '1.5rem',
      fontWeight: 900,
      color: colors.primary,
      textShadow: `0 0 20px rgba(232, 65, 66, 0.5)`,
    },
    battleBarTrack: {
      height: '12px',
      background: colors.backgroundDark,
      borderRadius: '6px',
      overflow: 'hidden',
      display: 'flex',
    },
    pawsBar: {
      height: '100%',
      background: `linear-gradient(90deg, ${colors.pawGreen}, ${colors.pawAmber})`,
      transition: 'width 0.5s ease',
    },
    clawsBar: {
      height: '100%',
      background: `linear-gradient(90deg, ${colors.clawPurple}, ${colors.clawCyan})`,
      transition: 'width 0.5s ease',
    },
    // Prize Categories styles
    prizeContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
    },
    prizeCard: {
      padding: '24px',
      borderRadius: '12px',
      background: colors.surface,
      textAlign: 'center',
    },
    prizeCardGrand: {
      border: `2px solid ${colors.gold}`,
      boxShadow: `0 0 20px rgba(251, 191, 36, 0.2)`,
    },
    prizeCardPaw: {
      border: `2px solid ${colors.pawGreen}`,
      boxShadow: `0 0 20px rgba(34, 197, 94, 0.15)`,
    },
    prizeCardClaw: {
      border: `2px solid ${colors.clawPurple}`,
      boxShadow: `0 0 20px rgba(168, 85, 247, 0.15)`,
    },
    prizeIcon: {
      fontSize: '2.5rem',
      marginBottom: '12px',
    },
    prizeTitle: {
      fontSize: '1.1rem',
      fontWeight: 700,
      marginBottom: '8px',
    },
    prizeDesc: {
      fontSize: '0.85rem',
      color: colors.textMuted,
      lineHeight: 1.5,
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
      textDecoration: 'none',
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
      minWidth: '1300px',
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
    pawRow: {
      background: 'rgba(34, 197, 94, 0.03)',
    },
    clawRow: {
      background: 'rgba(168, 85, 247, 0.03)',
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
    factionBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    pawBadge: {
      background: 'rgba(34, 197, 94, 0.15)',
      color: colors.pawGreen,
    },
    clawBadge: {
      background: 'rgba(168, 85, 247, 0.15)',
      color: colors.clawPurple,
    },
    positiveValue: {
      color: colors.success,
    },
    negativeValue: {
      color: colors.error,
    },
    footer: {
      borderTop: `1px solid ${colors.surface}`,
      marginTop: '48px',
      padding: '48px 24px 32px',
    },
    footerJoinSection: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    footerJoinTitle: {
      fontSize: '1.5rem',
      fontWeight: 700,
      marginBottom: '16px',
    },
    footerButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '16px',
    },
    pawButton: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${colors.pawGreen}, ${colors.pawAmber})`,
      border: 'none',
      borderRadius: '8px',
      color: colors.text,
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    clawButton: {
      padding: '12px 24px',
      background: `linear-gradient(135deg, ${colors.clawPurple}, ${colors.clawCyan})`,
      border: 'none',
      borderRadius: '8px',
      color: colors.text,
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    footerDiscord: {
      fontSize: '0.9rem',
      color: colors.textMuted,
    },
    footerCredits: {
      textAlign: 'center',
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
        }).format(value) + ' $VAPE';
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

      // Fetch signer data to replace trader addresses and detect Claws
      let signerMap = {};
      let newSignerData = {};
      let pawsCount = 0, clawsCount = 0, pawsVolume = 0, clawsVolume = 0;
      
      try {
        const signerRes = await fetch('/leaderboard_data.json');
        if (signerRes.ok) {
          const signerDataArray = await signerRes.json();
          signerDataArray.forEach(item => {
            if (item.address && item.signer) {
              const lowerAddress = item.address.toLowerCase();
              signerMap[lowerAddress] = item.signer;
              newSignerData[lowerAddress] = {
                signer: item.signer,
                volume: item.volume || 0,
              };
              
              // Calculate faction stats
              // If signer === address, it's a Claw (bot/agent)
              const isClaw = item.signer.toLowerCase() === lowerAddress;
              if (isClaw) {
                clawsCount++;
                clawsVolume += item.volume || 0;
              } else {
                pawsCount++;
                pawsVolume += item.volume || 0;
              }
            }
          });
          
          // Update signer data state
          setSignerData(newSignerData);
          
          // Calculate percentages
          const totalVolume = pawsVolume + clawsVolume;
          const pawsPercent = totalVolume > 0 ? Math.round((pawsVolume / totalVolume) * 100) : 50;
          const clawsPercent = 100 - pawsPercent;
          
          // Update faction stats
          setFactionStats({
            pawsCount,
            clawsCount,
            pawsVolume,
            clawsVolume,
            pawsPercent,
            clawsPercent,
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
        
        // Store original proxy address for faction detection
        enrichedRow._originalTrader = row.trader;
        
        // Replace trader address with signer address if available
        if (row.trader && signerMap[row.trader.toLowerCase()]) {
          enrichedRow.trader = signerMap[row.trader.toLowerCase()];
        }
        
        valuationColumns.forEach(({ name, multiplier }) => {
          enrichedRow[name] = rewardAmount * multiplier;
        });
        
        return enrichedRow;
      });

      // Add Faction column after rank_num
      const rankIndex = cols.indexOf('rank_num');
      const newCols = [...cols];
      if (rankIndex !== -1) {
        newCols.splice(rankIndex + 1, 0, 'faction');
      }

      // Add valuation columns after reward_amount
      const rewardIndex = newCols.indexOf('reward_amount');
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

  const getRowStyle = (index, originalTraderAddress) => {
    const baseStyle = { ...styles.tr };
    const faction = getFaction(originalTraderAddress);
    
    // Top 3 ranks have priority styling
    if (index === 0) return { ...baseStyle, ...styles.rank1 };
    if (index === 1) return { ...baseStyle, ...styles.rank2 };
    if (index === 2) return { ...baseStyle, ...styles.rank3 };
    
    // Apply subtle faction tint for other rows
    if (faction === 'claw') {
      return { ...baseStyle, ...styles.clawRow };
    }
    return { ...baseStyle, ...styles.pawRow };
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span style={{...styles.badge, ...styles.badgeGold}}>1</span>;
    if (index === 1) return <span style={{...styles.badge, ...styles.badgeSilver}}>2</span>;
    if (index === 2) return <span style={{...styles.badge, ...styles.badgeBronze}}>3</span>;
    return null;
  };

  const formatColumnName = (col) => {
    if (col === 'faction') return 'Faction';
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderFactionBadge = (address) => {
    const faction = getFaction(address);
    if (faction === 'claw') {
      return (
        <span style={{...styles.factionBadge, ...styles.clawBadge}}>
          ⚙️ Claw
        </span>
      );
    }
    return (
      <span style={{...styles.factionBadge, ...styles.pawBadge}}>
        🐾 Paw
      </span>
    );
  };

  const renderCellValue = (row, col) => {
    // Handle faction column specially - use original trader address for detection
    if (col === 'faction') {
      return renderFactionBadge(row._originalTrader || row.trader);
    }

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

  // Faction Battle Bar Component
  const FactionBattleBar = () => (
    <div style={styles.battleBarContainer}>
      <div style={styles.battleBarHeader}>
        <div style={{...styles.factionSide, alignItems: 'flex-start'}}>
          <div style={{...styles.factionName, color: colors.pawGreen}}>
            🐾 Paws
          </div>
          <div style={styles.factionStats}>
            {factionStats.pawsCount.toLocaleString()} traders • ${(factionStats.pawsVolume / 1000).toFixed(0)}K volume
          </div>
        </div>
        <div style={styles.vsText}>VS</div>
        <div style={{...styles.factionSide, alignItems: 'flex-end'}}>
          <div style={{...styles.factionName, color: colors.clawPurple}}>
            Claws ⚙️
          </div>
          <div style={styles.factionStats}>
            {factionStats.clawsCount.toLocaleString()} agents • ${(factionStats.clawsVolume / 1000).toFixed(0)}K volume
          </div>
        </div>
      </div>
      <div style={styles.battleBarTrack}>
        <div style={{...styles.pawsBar, width: `${factionStats.pawsPercent}%`}} />
        <div style={{...styles.clawsBar, width: `${factionStats.clawsPercent}%`}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', fontWeight: 600}}>
        <span style={{color: colors.pawGreen}}>{factionStats.pawsPercent}%</span>
        <span style={{color: colors.clawPurple}}>{factionStats.clawsPercent}%</span>
      </div>
    </div>
  );

  // Prize Categories Component
  const PrizeCategories = () => (
    <div style={styles.prizeContainer}>
      <div style={{...styles.prizeCard, ...styles.prizeCardGrand}}>
        <div style={styles.prizeIcon}>🏆</div>
        <div style={{...styles.prizeTitle, color: colors.gold}}>The Grand Prize</div>
        <div style={styles.prizeDesc}>
          Highest Efficiency Score<br/>
          <span style={{color: colors.textMuted, fontSize: '0.8rem'}}>(PnL² / Volume)</span>
        </div>
      </div>
      <div style={{...styles.prizeCard, ...styles.prizeCardPaw}}>
        <div style={styles.prizeIcon}>🐾</div>
        <div style={{...styles.prizeTitle, color: colors.pawGreen}}>The Golden Paw</div>
        <div style={styles.prizeDesc}>
          Best Human Trader<br/>
          <span style={{color: colors.textMuted, fontSize: '0.8rem'}}>Proving intuition beats algorithms</span>
        </div>
      </div>
      <div style={{...styles.prizeCard, ...styles.prizeCardClaw}}>
        <div style={styles.prizeIcon}>⚙️</div>
        <div style={{...styles.prizeTitle, color: colors.clawPurple}}>The Apex Claw</div>
        <div style={styles.prizeDesc}>
          Most Efficient Agent<br/>
          <span style={{color: colors.textMuted, fontSize: '0.8rem'}}>The machine that outperformed all</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <img src="/paws-vs-claws-logo.png" alt="Paws vs Claws" style={{height: '50px', width: 'auto'}} />
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
            The Arena is Open. 0.4% of $VAPE supply awaits the warriors who discover the true price. Are you a Paw or a Claw?
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
            <div style={styles.statItem}>
              <div style={{...styles.statValue, color: colors.pawGreen}}>
                {factionStats.pawsCount.toLocaleString()}
              </div>
              <div style={styles.statLabel}>🐾 Paws</div>
            </div>
            <div style={styles.statItem}>
              <div style={{...styles.statValue, color: colors.clawPurple}}>
                {factionStats.clawsCount.toLocaleString()}
              </div>
              <div style={styles.statLabel}>⚙️ Claws</div>
            </div>
          </div>
        </div>

        {/* Faction Battle Bar */}
        <FactionBattleBar />

        {/* Prize Categories */}
        <PrizeCategories />

        {/* Polymarket Widget */}
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
                  {data.map((row, rowIdx) => {
                    const originalAddress = row._originalTrader || row.trader;
                    return (
                      <tr 
                        key={rowIdx} 
                        style={getRowStyle(rowIdx, originalAddress)}
                        onMouseEnter={(e) => {
                          if (rowIdx > 2) {
                            e.currentTarget.style.background = colors.surfaceLight;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (rowIdx > 2) {
                            const faction = getFaction(originalAddress);
                            e.currentTarget.style.background = faction === 'claw' 
                              ? 'rgba(168, 85, 247, 0.03)' 
                              : 'rgba(34, 197, 94, 0.03)';
                          }
                        }}
                      >
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} style={styles.td}>
                            {col === 'rank_num' && getRankBadge(rowIdx)}
                            {renderCellValue(row, col)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
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
        <div style={styles.footerJoinSection}>
          <div style={styles.footerJoinTitle}>Join the Battle</div>
          <div style={styles.footerButtons}>
            <a 
              href="https://form.typeform.com/to/XzkXSGYq" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.pawButton}
            >
              🐾 Join the Paws
            </a>
            <a 
              href="https://form.typeform.com/to/cr5HbKt8" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.clawButton}
            >
              ⚙️ Deploy Your Claws
            </a>
          </div>
          <div style={styles.footerDiscord}>
            Questions? Join <a href="https://discord.gg/puffpaw" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>#waitingroom on Discord</a>
          </div>
        </div>
        
        <div style={styles.footerCredits}>
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
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover, a:hover {
          opacity: 0.9;
          transform: translateY(-1px);
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
