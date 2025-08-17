import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export function DataSourceUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setUploadError('Please upload a valid file.');
      return;
    }

    const file = acceptedFiles[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      setUploadError('Unsupported file type. Please upload a CSV or Excel file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20 MB limit
      setUploadError('File size exceeds 20MB limit.');
      return;
    }

    setFile(file);
    setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
    setUploadError(null);
    setUploadSuccess(false);
    setProcessingStatus('idle');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const handleRemoveFile = () => {
    setFile(null);
    setFileSize(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    setUploadSuccess(false);
    setProcessingStatus('idle');
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);

    try {
      // In a real app, you would send this to your backend API
      // For demo purposes, we'll simulate the upload process
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Simulate API call delay
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        setUploadSuccess(true);
        
        // Start AI processing
        setProcessingStatus('processing');
        
        // Simulate AI processing
        setTimeout(() => {
          setProcessingStatus('completed');
        }, 3000);
      }, 2000);
      
      // In a real app, this would be your API call:
      // const response = await axios.post('/api/data-sources/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   },
      //   onUploadProgress: (progressEvent) => {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     setUploadProgress(percentCompleted);
      //   }
      // });
      // setUploadSuccess(true);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
      setProcessingStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Your Data for AI Analysis</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600'}
            ${uploadError ? 'border-red-500' : ''}
            ${!file ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}`}
        >
          <input {...getInputProps()} />
          {!file && (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {isDragActive ? 'Drop the file here...' : 'Drag and drop your CSV or Excel file here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Max file size: 20MB (.csv, .xlsx, .xls)
              </p>
            </>
          )}
          {file && !isUploading && !uploadSuccess && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentIcon className="h-10 w-10 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{fileSize}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentIcon className="h-10 w-10 text-primary-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{fileSize}</p>
                  </div>
                </div>
                <span className="text-sm text-primary-600 dark:text-primary-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-md border border-red-200 dark:border-red-800">
            {uploadError}
          </div>
        )}

        {file && !isUploading && !uploadSuccess && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Upload & Analyze
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4">
            {processingStatus === 'processing' && (
              <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-md bg-primary-50 dark:bg-primary-900/30">
                <div className="flex items-center">
                  <ArrowPathIcon className="h-5 w-5 text-primary-500 mr-2 animate-spin" />
                  <div>
                    <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">AI Processing</h3>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      Our AI is analyzing your data for insights. This may take a few moments...
                    </p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-primary-200 dark:bg-primary-800 rounded-full h-1.5">
                  <div className="bg-primary-600 h-1.5 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            )}
            
            {processingStatus === 'completed' && (
              <div className="p-4 border border-green-200 dark:border-green-800 rounded-md bg-green-50 dark:bg-green-900/30">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Analysis Complete</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Your data has been successfully processed. View the insights below.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {processingStatus === 'error' && (
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/30">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Processing Error</h3>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      There was an error processing your data. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {processingStatus === 'completed' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Analysis Results</h2>
          
          <div className="space-y-6">
            {/* Data Quality Summary */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Data Quality Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300">Completeness</div>
                  <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">98%</div>
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400">2% missing values detected</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Consistency</div>
                  <div className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">92%</div>
                  <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Some inconsistent formats found</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Accuracy</div>
                  <div className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">95%</div>
                  <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">Few outliers detected</div>
                </div>
              </div>
            </div>
            
            {/* Key Insights */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Key Insights</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Strong correlation detected</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        There's a strong positive correlation (0.87) between marketing spend and sales with a 2-week lag.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Seasonal pattern identified</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Your data shows a clear seasonal pattern with peaks in Q4 (holiday season) and Q2 (summer).
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Anomaly detected</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Unusual spike in returns for Product X in June - 43% higher than the average.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommended Actions */}
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Recommended Actions</h3>
              <div className="space-y-3">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-primary-800 dark:text-primary-300">
                        Increase marketing budget for Q4 by 15-20% based on historical ROI data.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-primary-800 dark:text-primary-300">
                        Investigate Product X quality issues to address the abnormal return rate.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-primary-800 dark:text-primary-300">
                        Optimize inventory levels for Q2 and Q4 peak seasons to avoid stockouts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Next Steps</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Explore detailed insights or ask specific questions about your data
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  View Full Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Ask AI Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}