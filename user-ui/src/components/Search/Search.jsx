import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionContext } from '../../context/TransactionContext';
import { FaSearch, FaTimes } from 'react-icons/fa';
import dataService from '../../services/DataService';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [useBlockchainData, setUseBlockchainData] = useState(false);
  const { nfts, getAllNFTs } = useContext(TransactionContext);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Load NFTs if they're not already loaded and we're using blockchain data
  useEffect(() => {
    if (useBlockchainData && (!nfts || (Array.isArray(nfts) && nfts.length === 0))) {
      getAllNFTs();
    }
  }, [nfts, getAllNFTs, useBlockchainData]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsLoading(true);
    
    if (term.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      setNoResults(false);
      setIsLoading(false);
      return;
    }

    // Simulate a slight delay for better UX
    setTimeout(async () => {
      let results = [];
      
      if (useBlockchainData) {
        // Use blockchain data (NFTs from context)
        results = nfts && Array.isArray(nfts) 
          ? nfts.filter(nft => 
              (nft.IPname && nft.IPname.toLowerCase().includes(term.toLowerCase())) ||
              (nft.fullname && nft.fullname.toLowerCase().includes(term.toLowerCase())) ||
              (nft.country && nft.country.toLowerCase().includes(term.toLowerCase())) ||
              (nft.description && nft.description.toLowerCase().includes(term.toLowerCase()))
            )
          : [];
      } else {
        // Use local dataset from CSV
        try {
          results = await dataService.searchIPs(term);
        } catch (error) {
          console.error('Error searching CSV data:', error);
          results = [];
        }
      }

      setSearchResults(results);
      setShowResults(true);
      setNoResults(results.length === 0);
      setIsLoading(false);
    }, 300);
  };

  const handleResultClick = (tokenId) => {
    navigate(`/mynftdetail/${tokenId}`);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim() !== '') {
      // Navigate to search results page with the search term as a query parameter
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
    } else if (searchResults.length > 0) {
      // If there are results and user presses enter, navigate to the first result
      handleResultClick(searchResults[0].tokenId);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setNoResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-2.5"
            placeholder="Search IPs by name, owner, country..."
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => {
              if (searchTerm.trim() !== '') {
                setShowResults(true);
              }
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
            >
              <FaTimes className="text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      </form>

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Searching...
            </div>
          ) : noResults ? (
            <div className="px-4 py-3 text-center text-gray-500">
              No results found for "{searchTerm}"
            </div>
          ) : (
            <>
              {searchResults.slice(0, 5).map((result) => (
                <div
                  key={result.tokenId}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100"
                  onClick={() => handleResultClick(result.tokenId)}
                >
                  <div className="font-medium">{result.IPname}</div>
                  <div className="text-sm text-gray-500">
                    {result.fullname} - {result.country}
                  </div>
                  {result.description && (
                    <div className="text-xs text-gray-400 truncate mt-1">
                      {result.description.substring(0, 60)}
                      {result.description.length > 60 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
              
              {searchResults.length > 5 && (
                <div 
                  className="px-4 py-3 text-center text-blue-600 font-medium cursor-pointer hover:bg-gray-50 border-t border-gray-100"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                    setShowResults(false);
                  }}
                >
                  View all {searchResults.length} results
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;