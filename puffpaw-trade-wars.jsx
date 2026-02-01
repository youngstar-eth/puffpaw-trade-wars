import React, { useState, useEffect } from 'react';

const PuffpawTradeWars = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const [limit, setLimit] = useState(1000);

  const QUERY_ID = '6622482';
  const API_BASE = 'https://api.dune.com/api/v1';

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#ffffff',
      fontFamily: "'Rajdhani', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    },
    backgroundGrid: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `
        linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      pointerEvents: 'none',
      zIndex: 0,
    },
    glow: {
      position: 'fixed',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0,
      animation: 'pulse 8s ease-in-out infinite',
    },
    content: {
      position: 'relative',
      zIndex: 1,
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      paddingTop: '20px',
    },
    title: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: 'clamp(2rem, 5vw, 4rem)',
      fontWeight: 900,
      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '10px',
      textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#a0a0a0',
      fontWeight: 400,
    },
    apiInputContainer: {
      background: 'rgba(139, 92, 246, 0.1)',
      border: '2px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '30px',
      backdropFilter: 'blur(10px)',
    },
    apiInput: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(139, 92, 246, 0.5)',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem',
      fontFamily: "'Rajdhani', sans-serif",
      marginBottom: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    button: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      border: 'none',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: "'Rajdhani', sans-serif",
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    tableContainer: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '16px',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '20px 16px',
      textAlign: 'left',
      background: 'rgba(139, 92, 246, 0.2)',
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: '2px solid rgba(139, 92, 246, 0.5)',
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.95rem',
    },
    tr: {
      transition: 'all 0.2s ease',
    },
    trHover: {
      background: 'rgba(139, 92, 246, 0.1)',
    },
    rank1: {
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.05) 100%)',
      borderLeft: '4px solid #fbbf24',
    },
    rank2: {
      background: 'linear-gradient(135deg, rgba(209, 213, 219, 0.2) 0%, rgba(209, 213, 219, 0.05) 100%)',
      borderLeft: '4px solid #d1d5db',
    },
    rank3: {
      background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(217, 119, 6, 0.05) 100%)',
      borderLeft: '4px solid #d97706',
    },
    loading: {
      textAlign: 'center',
      padding: '60px 20px',
      fontSize: '1.2rem',
      color: '#a0a0a0',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '2px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '12px',
      padding: '20px',
      color: '#ff6b6b',
      textAlign: 'center',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: 600,
      marginRight: '8px',
    },
    badgeGold: {
      background: 'rgba(251, 191, 36, 0.2)',
      color: '#fbbf24',
      border: '1px solid #fbbf24',
    },
    badgeSilver: {
      background: 'rgba(209, 213, 219, 0.2)',
      color: '#d1d5db',
      border: '1px solid #d1d5db',
    },
    badgeBronze: {
      background: 'rgba(217, 119, 6, 0.2)',
      color: '#d97706',
      border: '1px solid #d97706',
    },
  };

  const formatValue = (value, columnName) => {
    if (value === null || value === undefined) return '-';
    
    const lowerCol = columnName.toLowerCase();
    
    // USD formatting
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
    
    // Percentage formatting
    if (lowerCol.includes('pnl') || lowerCol.includes('percent') || lowerCol.includes('%')) {
      if (typeof value === 'number') {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
      }
    }
    
    // Large number formatting
    if (typeof value === 'number' && Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    }
    
    // Address/wallet formatting
    if (lowerCol.includes('wallet') || lowerCol.includes('address')) {
      if (typeof value === 'string' && value.length > 20) {
        return `${value.slice(0, 6)}...${value.slice(-4)}`;
      }
    }
    
    return value;
  };

  const fetchData = async () => {
    if (!apiKey.trim()) {
      setError('Lütfen API key giriniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/query/${QUERY_ID}/results?limit=${limit}`, {
        headers: {
          'x-dune-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Geçersiz API key. Lütfen kontrol edin.');
        }
        throw new Error(`API hatası: ${response.status}`);
      }

      const json = await response.json();
      
      if (!json.result || !json.result.rows || json.result.rows.length === 0) {
        throw new Error('Veri bulunamadı. Query\'nin execute edilmiş olması gerekiyor.');
      }

      const rows = json.result.rows;
      const cols = json.result.metadata?.column_names || 
                   (rows.length > 0 ? Object.keys(rows[0]) : []);

      setColumns(cols);
      setData(rows);
      setShowApiInput(false);
    } catch (err) {
      setError(err.message || 'Veri çekilirken bir hata oluştu');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRowStyle = (index) => {
    const baseStyle = { ...styles.tr };
    if (index === 0) return { ...baseStyle, ...styles.rank1 };
    if (index === 1) return { ...baseStyle, ...styles.rank2 };
    if (index === 2) return { ...baseStyle, ...styles.rank3 };
    return baseStyle;
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span style={{...styles.badge, ...styles.badgeGold}}>🥇</span>;
    if (index === 1) return <span style={{...styles.badge, ...styles.badgeSilver}}>🥈</span>;
    if (index === 2) return <span style={{...styles.badge, ...styles.badgeBronze}}>🥉</span>;
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGrid} />
      <div style={styles.glow} />
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🐦 Puffpaw Trade Wars</h1>
          <p style={styles.subtitle}>Leaderboard</p>
        </div>

        {showApiInput && (
          <div style={styles.apiInputContainer}>
            <input
              type="password"
              placeholder="Dune API Key giriniz..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchData()}
              style={styles.apiInput}
            />
            <input
              type="number"
              placeholder="Limit (varsayılan: 1000)"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 1000)}
              style={{...styles.apiInput, marginBottom: '12px'}}
              min="1"
              max="10000"
            />
            <button onClick={fetchData} style={styles.button}>
              Veriyi Yükle
            </button>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <strong>❌ Hata:</strong> {error}
            {!showApiInput && (
              <div style={{ marginTop: '12px' }}>
                <button 
                  onClick={() => {
                    setShowApiInput(true);
                    setError(null);
                  }} 
                  style={styles.button}
                >
                  API Key'i Değiştir
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div style={styles.loading}>
            <div>⏳ Veri yükleniyor...</div>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div>
            <div style={{...styles.apiInputContainer, marginBottom: '20px', padding: '12px 20px'}}>
              <strong>📊 Toplam {data.length} kayıt gösteriliyor</strong>
              {!showApiInput && (
                <button 
                  onClick={() => {
                    setShowApiInput(true);
                    setError(null);
                  }} 
                  style={{...styles.button, marginLeft: '12px', padding: '8px 16px', fontSize: '0.9rem'}}
                >
                  Ayarları Değiştir
                </button>
              )}
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} style={styles.th}>
                      {col}
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
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
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
                        {formatValue(row[col], col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {!loading && !error && data.length === 0 && !showApiInput && (
          <div style={styles.loading}>
            <div>📊 Veri bulunamadı</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }
        @media (max-width: 768px) {
          table { font-size: 0.85rem; }
          th, td { padding: 12px 8px; }
        }
      `}</style>
    </div>
  );
};

export default PuffpawTradeWars;

