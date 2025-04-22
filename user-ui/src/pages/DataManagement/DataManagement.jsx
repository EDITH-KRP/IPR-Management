import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CsvUploader } from '../../components';
import dataService from '../../services/DataService';
import { FaArrowLeft, FaSearch, FaDownload, FaInfoCircle } from 'react-icons/fa';

const DataManagement = () => {
  const navigate = useNavigate();
  const [datasetInfo, setDatasetInfo] = useState({
    loaded: false,
    count: 0,
    categories: [],
    countries: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDatasetInfo();
  }, []);

  const loadDatasetInfo = async () => {
    setIsLoading(true);
    try {
      const allIPs = await dataService.getAllIPs();
      const categories = await dataService.getCategories();
      const countries = await dataService.getCountries();
      
      setDatasetInfo({
        loaded: true,
        count: allIPs.length,
        categories,
        countries
      });
    } catch (error) {
      console.error('Error loading dataset info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadDatasetInfo();
  };

  const downloadSampleCsv = () => {
    const link = document.createElement('a');
    link.href = '/data/ipDataset.csv';
    link.download = 'sample_ip_dataset.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-2xl font-bold">Dataset Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Dataset</h2>
            <CsvUploader onUploadSuccess={handleUploadSuccess} />
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={downloadSampleCsv}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaDownload className="mr-2" />
                Download Sample CSV
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Use this sample as a template for your own dataset.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">CSV Format Requirements</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-2">Your CSV file should include the following columns:</p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>tokenId</strong> - Unique identifier for the IP</li>
                <li><strong>IPname</strong> - Name of the intellectual property</li>
                <li><strong>fullname</strong> - Owner's full name</li>
                <li><strong>owner</strong> - Owner's wallet address</li>
                <li><strong>country</strong> - Country of origin</li>
                <li><strong>description</strong> - Detailed description</li>
                <li><strong>category</strong> - Category or industry</li>
                <li><strong>registrationDate</strong> - Date of registration (YYYY-MM-DD)</li>
                <li><strong>status</strong> - Current status (Approved, Pending, Rejected)</li>
                <li><strong>image</strong> - URL to an image (optional)</li>
              </ul>
              <div className="flex items-center bg-blue-50 p-3 rounded-md">
                <FaInfoCircle className="text-blue-500 mr-2 flex-shrink-0" />
                <p className="text-blue-700">
                  Make sure your CSV has a header row with these column names. Values with commas should be enclosed in double quotes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Dataset</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2 text-gray-600">Loading dataset information...</p>
              </div>
            ) : datasetInfo.loaded ? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Total IPs</p>
                    <p className="text-2xl font-bold">{datasetInfo.count}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500">Categories</p>
                    <p className="text-2xl font-bold">{datasetInfo.categories.length}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {datasetInfo.categories.map(category => (
                      <span 
                        key={category} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Countries</h3>
                  <div className="flex flex-wrap gap-2">
                    {datasetInfo.countries.map(country => (
                      <span 
                        key={country} 
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  <FaSearch className="mr-2" />
                  Search Dataset
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No dataset loaded</p>
                <p className="text-sm text-gray-500 mt-2">Upload a CSV file to get started</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Using Your Dataset</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-3">
                After uploading your CSV file, the data will be available for searching through the application's search functionality.
              </p>
              <p className="mb-3">
                The search engine will index all columns in your dataset, allowing users to find IPs by name, owner, country, description, or category.
              </p>
              <p className="mb-3">
                Your dataset is stored in the browser's memory and will be available until you refresh or close the page. To make it permanent, you would need to save it to the server.
              </p>
              <div className="flex items-center bg-yellow-50 p-3 rounded-md">
                <FaInfoCircle className="text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-yellow-700">
                  For large datasets, the initial load might take a few seconds. The search engine is optimized to handle thousands of records efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;