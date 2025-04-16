import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import './CryptoCharts.css';

const CryptoCharts = () => {
  const [cryptoData, setCryptoData] = useState({
    bitcoin: { price: 0, change24h: 0, chart: [] },
    ethereum: { price: 0, change24h: 0, chart: [] }
  });
  const [loading, setLoading] = useState(true);

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

  const getChartOptions = (cryptoName) => {
    return {
      chart: {
        type: 'area',
        height: 250,
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
        text: `${cryptoName} Price (Last 7 Days)`,
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

  return (
    <div className="crypto-charts-container">
      <h2 className="charts-title">Cryptocurrency Market Data</h2>
      
      <div className="crypto-cards">
        <div className="crypto-card bitcoin">
          <div className="crypto-info">
            <h3>Bitcoin (BTC)</h3>
            <p className="crypto-price">${cryptoData.bitcoin.price.toLocaleString()}</p>
            <p className={`price-change ${cryptoData.bitcoin.change24h >= 0 ? 'positive' : 'negative'}`}>
              {cryptoData.bitcoin.change24h >= 0 ? '↑' : '↓'} 
              {Math.abs(cryptoData.bitcoin.change24h || 0).toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="crypto-card ethereum">
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
      
      <div className="charts-grid">
        <div className="chart-container">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <ReactApexChart 
              options={getChartOptions('Bitcoin')} 
              series={[{ 
                name: 'Bitcoin',
                data: cryptoData.bitcoin.chart 
              }]} 
              type="area" 
              height={250} 
            />
          )}
        </div>
        
        <div className="chart-container">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <ReactApexChart 
              options={getChartOptions('Ethereum')} 
              series={[{ 
                name: 'Ethereum',
                data: cryptoData.ethereum.chart 
              }]} 
              type="area" 
              height={250} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoCharts; 