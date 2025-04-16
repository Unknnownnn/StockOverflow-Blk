import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import './CryptoExchange.css';

const CryptoExchange = ({ contract, account }) => {
  const [cryptoData, setCryptoData] = useState({
    bitcoin: { price: 0, chart: [] },
    ethereum: { price: 0, chart: [] }
  });
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [exchangeHistory, setExchangeHistory] = useState(() => {
    const saved = localStorage.getItem('exchangeHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch crypto data when component mounts
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        
        // Get current prices
        const priceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'bitcoin,ethereum',
            vs_currencies: 'usd',
            include_24hr_change: true
          }
        });
        
        // Get historical data for charts (7 days)
        const btcHistoryResponse = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
          params: {
            vs_currency: 'usd',
            days: '7',
            interval: 'daily'
          }
        });
        
        const ethHistoryResponse = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum/market_chart', {
          params: {
            vs_currency: 'usd',
            days: '7',
            interval: 'daily'
          }
        });
        
        setCryptoData({
          bitcoin: {
            price: priceResponse.data.bitcoin.usd,
            change24h: priceResponse.data.bitcoin.usd_24h_change,
            chart: btcHistoryResponse.data.prices.map(item => ({
              x: new Date(item[0]),
              y: parseFloat(item[1]).toFixed(2)
            }))
          },
          ethereum: {
            price: priceResponse.data.ethereum.usd,
            change24h: priceResponse.data.ethereum.usd_24h_change,
            chart: ethHistoryResponse.data.prices.map(item => ({
              x: new Date(item[0]),
              y: parseFloat(item[1]).toFixed(2)
            }))
          }
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setLoading(false);
        
        // Use dummy data if API fails
        setCryptoData({
          bitcoin: {
            price: 65432,
            change24h: 2.5,
            chart: generateDummyData(65000, 7)
          },
          ethereum: {
            price: 3456,
            change24h: 1.8,
            chart: generateDummyData(3400, 7)
          }
        });
      }
    };
    
    fetchCryptoData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchCryptoData, 300000);
    return () => clearInterval(interval);
  }, []);
  
  // Save exchange history to local storage
  useEffect(() => {
    localStorage.setItem('exchangeHistory', JSON.stringify(exchangeHistory));
  }, [exchangeHistory]);
  
  const generateDummyData = (basePrice, days) => {
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      const randomChange = (Math.random() * 10 - 5) / 100; // -5% to 5%
      const price = basePrice * (1 + randomChange);
      
      data.push({
        x: date,
        y: price.toFixed(2)
      });
    }
    
    return data;
  };
  
  const getChartOptions = () => {
    return {
      chart: {
        type: 'area',
        height: 350,
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        },
        foreColor: '#38efe6'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#38efe6']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: "#38efe6",
              opacity: 0.4
            },
            {
              offset: 100,
              color: "#060709",
              opacity: 0
            }
          ]
        }
      },
      title: {
        text: `${selectedCrypto.charAt(0).toUpperCase() + selectedCrypto.slice(1)} Price (Last 7 Days)`,
        align: 'left',
        style: {
          fontSize: '16px',
          color: '#38efe6'
        }
      },
      grid: {
        borderColor: 'rgba(56, 239, 230, 0.1)',
        row: {
          colors: ['transparent'],
          opacity: 0.5
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: function(val) {
            return new Date(val).toLocaleDateString();
          }
        }
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return `$${val}`;
          }
        }
      },
      tooltip: {
        theme: 'dark',
        x: {
          format: 'dd MMM yyyy'
        }
      }
    };
  };
  
  const handleExchange = (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Add the exchange to history
    const newExchange = {
      id: Date.now(),
      crypto: selectedCrypto,
      amount: parseFloat(amount),
      usdValue: (parseFloat(amount) * cryptoData[selectedCrypto].price).toFixed(2),
      timestamp: new Date().toISOString()
    };
    
    setExchangeHistory(prev => [newExchange, ...prev]);
    setAmount('');
    alert(`Successfully exchanged ${amount} ${selectedCrypto} (Value: $${newExchange.usdValue})`);
  };
  
  const clearExchangeHistory = () => {
    localStorage.removeItem('exchangeHistory');
    setExchangeHistory([]);
  };

  return (
    <div className="crypto-exchange-container">
      <h1 className="exchange-title animated-gradient">Blockchain Exchange</h1>
      
      <div className="crypto-dashboard">
        <div className="crypto-prices">
          <div 
            className={`crypto-card ${selectedCrypto === 'bitcoin' ? 'selected' : ''}`}
            onClick={() => setSelectedCrypto('bitcoin')}
          >
            <div className="crypto-icon bitcoin"></div>
            <div className="crypto-info">
              <h3>Bitcoin (BTC)</h3>
              <p className="crypto-price">${cryptoData.bitcoin.price.toLocaleString()}</p>
              <p className={`price-change ${cryptoData.bitcoin.change24h >= 0 ? 'positive' : 'negative'}`}>
                {cryptoData.bitcoin.change24h >= 0 ? '↑' : '↓'} 
                {Math.abs(cryptoData.bitcoin.change24h || 0).toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div 
            className={`crypto-card ${selectedCrypto === 'ethereum' ? 'selected' : ''}`}
            onClick={() => setSelectedCrypto('ethereum')}
          >
            <div className="crypto-icon ethereum"></div>
            <div className="crypto-info">
              <h3>Ethereum (ETH)</h3>
              <p className="crypto-price">${cryptoData.ethereum.price.toLocaleString()}</p>
              <p className={`price-change ${cryptoData.ethereum.change24h >= 0 ? 'positive' : 'negative'}`}>
                {cryptoData.ethereum.change24h >= 0 ? '↑' : '↓'} 
                {Math.abs(cryptoData.ethereum.change24h || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="chart-container">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <ReactApexChart 
              options={getChartOptions()} 
              series={[{ 
                name: selectedCrypto,
                data: cryptoData[selectedCrypto].chart 
              }]} 
              type="area" 
              height={350} 
            />
          )}
        </div>
        
        <div className="exchange-form-container">
          <h2>Exchange {selectedCrypto.charAt(0).toUpperCase() + selectedCrypto.slice(1)}</h2>
          <form onSubmit={handleExchange} className="exchange-form">
            <div className="form-group">
              <label htmlFor="crypto-amount">Amount</label>
              <input
                id="crypto-amount"
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter ${selectedCrypto} amount`}
                required
              />
            </div>
            <div className="exchange-value">
              <p>≈ ${amount && !isNaN(parseFloat(amount)) ? 
                (parseFloat(amount) * cryptoData[selectedCrypto].price).toFixed(2) : 
                '0.00'}
              </p>
            </div>
            <button type="submit" className="exchange-button">Execute Exchange</button>
          </form>
        </div>
      </div>
      
      <div className="exchange-history">
        <div className="history-header">
          <h2>Exchange History</h2>
          {exchangeHistory.length > 0 && (
            <button onClick={clearExchangeHistory} className="clear-history-btn">
              Clear History
            </button>
          )}
        </div>
        
        {exchangeHistory.length > 0 ? (
          <div className="history-list">
            {exchangeHistory.map(exchange => (
              <div key={exchange.id} className="history-item">
                <div className="history-icon">
                  <div className={`crypto-icon-small ${exchange.crypto}`}></div>
                </div>
                <div className="history-details">
                  <h4>{exchange.crypto.charAt(0).toUpperCase() + exchange.crypto.slice(1)} Exchange</h4>
                  <p>{exchange.amount} {exchange.crypto.toUpperCase()} (${exchange.usdValue})</p>
                  <p className="history-timestamp">{new Date(exchange.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-history">No exchange history yet.</p>
        )}
      </div>
      
      <div className="mining-section">
        <h2>Soul ID Mining</h2>
        <p>Mint your Soul ID to participate in blockchain transactions</p>
        <button className="mining-button" onClick={() => document.querySelector('.company-details-box').scrollIntoView({ behavior: 'smooth' })}>
          Go to Mining
        </button>
      </div>
    </div>
  );
};

export default CryptoExchange; 