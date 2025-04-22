import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TransactionContext } from '../../context/TransactionContext';
import { FaSearch, FaArrowLeft, FaFilter } from 'react-icons/fa';
import { ShortenAddress } from '../../components/ShortenAddress';
import dataService from '../../services/DataService';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nfts, getAllNFTs } = useContext(TransactionContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useBlockchainData, setUseBlockchainData] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({
    name: true,
    owner: true,
    country: true,
    description: true,
    category: true
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  // Load categories and countries from dataset
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const categoriesData = await dataService.getCategories();
        const countriesData = await dataService.getCountries();
        setCategories(categoriesData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    
    loadFilters();
  }, []);

  // Get search term from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
    
    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  // Load NFTs if they're not already loaded and we're using blockchain data
  useEffect(() => {
    if (useBlockchainData && (!nfts || (Array.isArray(nfts) && nfts.length === 0))) {
      getAllNFTs();
    } else if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [nfts, getAllNFTs, useBlockchainData]);

  const performSearch = async (term) => {
    setIsLoading(true);
    
    let results = [];
    
    try {
      if (useBlockchainData) {
        // Use blockchain data (NFTs from context)
        results = nfts && Array.isArray(nfts) 
          ? nfts.filter(nft => {
              const matchName = filters.name && nft.IPname && nft.IPname.toLowerCase().includes(term.toLowerCase());
              const matchOwner = filters.owner && nft.fullname && nft.fullname.toLowerCase().includes(term.toLowerCase());
              const matchCountry = filters.country && nft.country && nft.country.toLowerCase().includes(term.toLowerCase());
              const matchDescription = filters.description && nft.description && nft.description.toLowerCase().includes(term.toLowerCase());
              
              return matchName || matchOwner || matchCountry || matchDescription;
            })
          : [];
      } else {
        // Use local dataset from CSV
        results = await dataService.searchIPs(term, filters);
        
        // Apply category filter if selected
        if (categoryFilter) {
          results = results.filter(ip => ip.category === categoryFilter);
        }
        
        // Apply status filter if selected
        if (statusFilter) {
          results = results.filter(ip => ip.status === statusFilter);
        }
      }
    } catch (error) {
      console.error('Error performing search:', error);
      results = [];
    }

    setSearchResults(results);
    setIsLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    performSearch(searchTerm);
  };

  const handleFilterChange = (filterName) => {
    const newFilters = { ...filters, [filterName]: !filters[filterName] };
    setFilters(newFilters);
    performSearch(searchTerm);
  };

  const handleResultClick = (tokenId) => {
    navigate(`/mynftdetail/${tokenId}`);
  };

  const handleDataSourceChange = (useBlockchain) => {
    setUseBlockchainData(useBlockchain);
    performSearch(searchTerm);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    performSearch(searchTerm);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    performSearch(searchTerm);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Search Results</h1>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
              placeholder="Search IPs by name, owner, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-3"
          >
            Search
          </button>
          <button 
            type="button"
            onClick={toggleFilterMenu}
            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm px-4 py-3"
          >
            <FaFilter />
          </button>
        </form>
      </div>

      {/* Data Source Selection */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Data Source:</div>
        <div className="flex">
          <label className="inline-flex items-center mr-6">
            <input 
              type="radio" 
              checked={!useBlockchainData} 
              onChange={() => handleDataSourceChange(false)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Local Dataset</span>
          </label>
          <label className="inline-flex items-center">
            <input 
              type="radio" 
              checked={useBlockchainData} 
              onChange={() => handleDataSourceChange(true)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Blockchain Data</span>
          </label>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterMenu && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">Search Filters</h3>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Search in:</div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={filters.name} 
                  onChange={() => handleFilterChange('name')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Name</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input 
                  type="checkbox" 
                  checked={filters.owner} 
                  onChange={() => handleFilterChange('owner')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Owner</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input 
                  type="checkbox" 
                  checked={filters.country} 
                  onChange={() => handleFilterChange('country')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Country</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input 
                  type="checkbox" 
                  checked={filters.description} 
                  onChange={() => handleFilterChange('description')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Description</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input 
                  type="checkbox" 
                  checked={filters.category} 
                  onChange={() => handleFilterChange('category')}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Category</span>
              </label>
            </div>
          </div>
          
          {!useBlockchainData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={categoryFilter} 
                    onChange={handleCategoryChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={handleStatusChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end">
            <button 
              onClick={() => {
                setFilters({
                  name: true,
                  owner: true,
                  country: true,
                  description: true,
                  category: true
                });
                setCategoryFilter('');
                setStatusFilter('');
                performSearch(searchTerm);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No results found for "{searchTerm}"</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-gray-600">{searchResults.length} results found for "{searchTerm}"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => (
              <div 
                key={result.tokenId} 
                className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleResultClick(result.tokenId)}
              >
                {result.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={result.image} 
                      alt={result.IPname} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{result.IPname}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Owner: {result.fullname} ({ShortenAddress(result.owner)})
                  </p>
                  <p className="text-sm text-gray-600 mb-2">Country: {result.country}</p>
                  {!useBlockchainData && result.category && (
                    <p className="text-sm text-gray-600 mb-2">
                      Category: <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{result.category}</span>
                    </p>
                  )}
                  {!useBlockchainData && result.status && (
                    <p className="text-sm text-gray-600 mb-2">
                      Status: <span className={`px-2 py-1 text-xs rounded-full ${
                        result.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        result.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>{result.status}</span>
                    </p>
                  )}
                  {result.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {result.description}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Token ID: {result.tokenId}</span>
                    <span className="text-xs font-medium text-blue-600">View Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;