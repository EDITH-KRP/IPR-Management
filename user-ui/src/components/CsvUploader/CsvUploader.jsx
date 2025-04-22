import React, { useState, useRef } from 'react';
import { FaUpload, FaFileAlt, FaCheck, FaTimes } from 'react-icons/fa';
import dataService from '../../services/DataService';

const CsvUploader = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setUploadStatus(null);
    } else {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadStatus(null);
    } else {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file first');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const data = await dataService.uploadCsvFile(file);
      setUploadStatus('success');
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setErrorMessage('Failed to process CSV file. Please check the format.');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleReset = () => {
    setFile(null);
    setUploadStatus(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Upload CSV Dataset</h3>
        <p className="text-sm text-gray-500">
          Upload a CSV file containing IP data to use in the search engine.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''} ${
          uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />

        {!file && !uploadStatus && (
          <>
            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your CSV file here, or{' '}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={handleBrowseClick}
              >
                browse
              </button>{' '}
              to select a file
            </p>
            <p className="mt-1 text-xs text-gray-500">CSV files only</p>
          </>
        )}

        {file && !uploadStatus && (
          <div className="mt-2">
            <div className="flex items-center justify-center">
              <FaFileAlt className="h-8 w-8 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">{file.name}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-2">
            <FaCheck className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 text-sm font-medium text-green-800">
              CSV file uploaded successfully!
            </p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-2">
            <FaTimes className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm font-medium text-red-800">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isUploading || !file}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleUpload}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isUploading || !file || uploadStatus === 'success'}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default CsvUploader;