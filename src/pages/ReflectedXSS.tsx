import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Search } from 'lucide-react';

function ReflectedXSS() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [reflectedContent, setReflectedContent] = useState('');

  useEffect(() => {
    // Get the message from URL parameters
    const params = new URLSearchParams(location.search);
    const message = params.get('message') || '';
    setReflectedContent(message);
  }, [location.search]);

  const handleSearch = () => {
    // Update URL with search query - this creates the reflected XSS vulnerability
    const newUrl = `${window.location.pathname}?message=${encodeURIComponent(searchQuery)}`;
    window.history.pushState({}, '', newUrl);
    setReflectedContent(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Reflected XSS Testing</h2>
        </div>

        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700 font-medium">
              This page is intentionally vulnerable to Reflected XSS attacks for educational purposes.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Search Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Search Messages</h3>
            <p className="text-gray-600 mb-4">
              Enter a search term below. The application will reflect your input back to you without proper sanitization.
            </p>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Try: <script>alert('XSS')</script>"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Results Section - Vulnerable to Reflected XSS */}
          {reflectedContent && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Search Results</h3>
              <div className="bg-white p-4 rounded border">
                <p className="text-gray-700 mb-2">You searched for:</p>
                {/* VULNERABILITY: Direct HTML injection without sanitization */}
                <div 
                  className="font-mono bg-gray-100 p-3 rounded text-sm"
                  dangerouslySetInnerHTML={{ __html: reflectedContent }}
                />
              </div>
            </div>
          )}

          {/* Educational Information */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">How to Test Reflected XSS</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>Basic Test:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code></p>
              <p><strong>Image Tag:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;img src=x onerror=alert('XSS')&gt;</code></p>
              <p><strong>SVG Payload:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;svg onload=alert('XSS')&gt;</code></p>
              <p><strong>Event Handler:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;div onmouseover=alert('XSS')&gt;Hover me&lt;/div&gt;</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReflectedXSS;