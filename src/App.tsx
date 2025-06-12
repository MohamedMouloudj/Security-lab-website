import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import Auth from './pages/Auth';
import SQLi from './pages/SQLi';
import ReflectedXSS from './pages/ReflectedXSS';
import StoredXSS from './pages/StoredXSS';
import DOMXSS from './pages/DOMXSS';

function App() {
  return (
    <Router>
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-indigo-700 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center">
                  <Shield className="w-10 h-10 mr-3" />
                  <div>
                    <h1 className="text-3xl font-bold">CyberTest Lab</h1>
                    <p className="text-indigo-200 text-sm">Private Security Testing Environment</p>
                  </div>
                </Link>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-sm">Personal Use Only</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
                <div>
                  <p className="text-yellow-700 font-medium">
                    Private Security Testing Laboratory
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    This is a controlled environment for learning about web security vulnerabilities.
                    This application is for personal educational use only and contains intentional security flaws.
                  </p>
                </div>
              </div>
            </div>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sqli" element={<SQLi />} />
              <Route path="/reflected-xss" element={<ReflectedXSS />} />
              <Route path="/stored-xss" element={<StoredXSS />} />
              <Route path="/dom-xss" element={<DOMXSS />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 mr-2" />
                <span>Private Testing Environment</span>
              </div>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>
                  This application is designed for personal educational use only.
                </p>
                <p>
                  Contains intentional security vulnerabilities for learning purposes.
                </p>
                <p>
                  Unauthorized access or use is prohibited.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </AuthGuard>
    </Router>
  );
}

export default App;