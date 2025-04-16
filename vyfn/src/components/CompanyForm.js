import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import CryptoSearch from './CryptoSearch';
import './CompanyForm.css';

const CompanyForm = ({ contract, account }) => {
  const [companyName, setCompanyName] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [mintedCompanies, setMintedCompanies] = useState([]);
  const [totalMinted, setTotalMinted] = useState(0);
  // Add local storage for demonstration
  const [localCompanies, setLocalCompanies] = useState(() => {
    const saved = localStorage.getItem('mintedCompanies');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (contract && account) {
      loadMintedCompanies();
      loadTotalMinted();
    }
  }, [contract, account]);

  // Save to local storage whenever localCompanies changes
  useEffect(() => {
    localStorage.setItem('mintedCompanies', JSON.stringify(localCompanies));
  }, [localCompanies]);

  const loadMintedCompanies = async () => {
    try {
      const userCompanies = await contract.getUserCompanies(account);
      const companiesDetails = await Promise.all(
        userCompanies.map(async (tokenId) => {
          const details = await contract.getCompanyDetails(tokenId);
          return {
            tokenId: tokenId.toString(),
            name: details.name,
            tokenAmount: details.tokenAmount,
            owner: details.owner
          };
        })
      );
      setMintedCompanies(companiesDetails);
    } catch (error) {
      console.error('Error loading minted companies:', error);
    }
  };

  const loadTotalMinted = async () => {
    try {
      const total = await contract.getTotalMinted();
      setTotalMinted(total.toString());
    } catch (error) {
      console.error('Error loading total minted:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contract) {
      try {
        if (!selectedCrypto) {
          alert('Please select a cryptocurrency');
          return;
        }
        
        const amount = parseInt(tokenAmount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Invalid token amount');
        }

        const cryptoId = `${selectedCrypto.name}${account.substring(0, 6)}`;
        
        await contract.mintCompany(cryptoId, amount);
        
        // Add to local storage immediately
        const newCompany = {
          tokenId: localCompanies.length.toString(),
          name: selectedCrypto.name,
          symbol: selectedCrypto.symbol,
          tokenAmount: amount,
          owner: account,
          timestamp: new Date().toISOString()
        };
        setLocalCompanies(prev => [...prev, newCompany]);
        
        alert(`${selectedCrypto.name} Exchange Blockchain Token minted successfully!`);
        setCompanyName('');
        setSelectedCrypto(null);
        setTokenAmount('');
        
        // Reload the blockchain state
        await loadMintedCompanies();
        await loadTotalMinted();
      } catch (error) {
        console.error('Error minting Exchange Blockchain Token:', error);
        alert('Error minting Exchange Blockchain Token. Check console for details.');
      }
    }
  };

  // Function to clear local storage (for testing)
  const clearLocalStorage = () => {
    localStorage.removeItem('mintedCompanies');
    setLocalCompanies([]);
  };

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setCompanyName(crypto.name);
  };

  return (
    <div className="company-container">
      <Hero 
        onConnectWallet={() => {
          if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_requestAccounts' });
          } else {
            alert('Please install MetaMask!');
          }
        }}
        isConnected={!!account}
      />

      {account ? (
        <div className="company-details-box">
          <h2>Exchange Blockchain Token</h2>
          <p className="mint-description">
            Mint a blockchain token for your selected cryptocurrency to participate in exchange transactions
          </p>
          
          <form onSubmit={handleSubmit} className="mint-form">
            <div className="form-crypto-group">
              <label>Select Cryptocurrency</label>
              <CryptoSearch 
                onSelect={handleCryptoSelect} 
                placeholder="Search for a cryptocurrency..."
              />
              
              {selectedCrypto && (
                <div className="selected-crypto">
                  <div className="selected-crypto-details">
                    <span className="selected-crypto-name">{selectedCrypto.name}</span>
                    <span className="selected-crypto-symbol">{selectedCrypto.symbol}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-amount-group">
              <label htmlFor="token-amount">Token Amount</label>
              <input
                id="token-amount"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter token amount"
                min="1"
                required
                className="token-amount-input"
              />
            </div>
            
            <button 
              type="submit" 
              className="mint-button"
              disabled={!selectedCrypto}
            >
              Mint Blockchain Token
            </button>
          </form>

          <div className="minted-companies">
            <h3>Your Blockchain Tokens</h3>
            <p>Total Minted: {localCompanies.length}</p>
            
            <div className="minted-list">
              {localCompanies.length > 0 ? (
                localCompanies.map((company) => (
                  <div key={company.tokenId} className="minted-item">
                    <div className="minted-details">
                      <h4>{company.name} {company.symbol && `(${company.symbol})`}</h4>
                      <p>Token Amount: {company.tokenAmount}</p>
                      <p className="timestamp">Minted: {new Date(company.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-minted">No blockchain tokens minted yet.</p>
              )}
            </div>

            {/* Development tools */}
            {process.env.NODE_ENV === 'development' && localCompanies.length > 0 && (
              <button 
                onClick={clearLocalStorage}
                className="clear-storage-btn"
              >
                Clear All Tokens
              </button>
            )}
          </div>
        </div>
      ) : (
        <p>Please connect your wallet to interact with the contract.</p>
      )}
    </div>
  );
};

export default CompanyForm;
