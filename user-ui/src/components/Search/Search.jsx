import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionContext } from '../../context/TransactionContext';
import { FaSearch } from 'react-icons/fa';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { nfts } = useContext(TransactionContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Filter NFTs based on search term
    const results = nfts ? nfts.filter(nft => 
      nft.IPname.toLowerCase().includes(term.toLowerCase()) ||
      nft.fullname.toLowerCase().includes(term.toLowerCase()) ||
      nft.country.toLowerCase().includes(term.toLowerCase()) ||
      nft.description.toLowerCase().includes(term.toLowerCase())
    ) : [];

    setSearchResults(results);
    setShowResults(true);
  };

  const handleResultClick = (tokenId) => {
    navigate(`/mynftdetail/${tokenId}`);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If there are results and user presses enter, navigate to the first result
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0].tokenId);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search IPs..."
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
        </div>
      </form>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result) => (
            <div
              key={result.tokenId}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleResultClick(result.tokenId)}
            >
              <div className="font-medium">{result.IPname}</div>
              <div className="text-sm text-gray-500">{result.fullname} - {result.country}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;