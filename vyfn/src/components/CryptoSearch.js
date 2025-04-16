import React, { useState, useEffect, useRef } from 'react';
import './CryptoSearch.css';

// List of popular cryptocurrencies
const CRYPTOCURRENCIES = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' }
];

const CryptoSearch = ({ onSelect, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Filter cryptocurrencies based on search term
    if (searchTerm.trim() === '') {
      setSuggestions(CRYPTOCURRENCIES);
    } else {
      const filtered = CRYPTOCURRENCIES.filter(
        crypto => 
          crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (onChange) onChange(e);
    setShowSuggestions(true);
  };

  const handleSelectCrypto = (crypto) => {
    setSearchTerm(crypto.name);
    setShowSuggestions(false);
    if (onSelect) onSelect(crypto);
  };

  return (
    <div className="crypto-search">
      <div className="crypto-search-input-container" ref={inputRef}>
        <input
          type="text"
          value={value || searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="crypto-search-input"
          placeholder={placeholder || "Search cryptocurrency..."}
        />
        {searchTerm && (
          <button 
            className="crypto-search-clear" 
            onClick={() => {
              setSearchTerm('');
              if (onChange) onChange({ target: { value: '' } });
            }}
          >
            ×
          </button>
        )}
      </div>
      
      {showSuggestions && (
        <div className="crypto-suggestions-container" ref={suggestionsRef}>
          {suggestions.length > 0 ? (
            <ul className="crypto-suggestions-list">
              {suggestions.map(crypto => (
                <li 
                  key={crypto.id} 
                  className="crypto-suggestion-item"
                  onClick={() => handleSelectCrypto(crypto)}
                >
                  <div className="crypto-suggestion-details">
                    <span className="crypto-suggestion-name">{crypto.name}</span>
                    <span className="crypto-suggestion-symbol">{crypto.symbol}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="crypto-no-suggestions">No cryptocurrencies found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CryptoSearch; 