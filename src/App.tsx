import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, AlertTriangle, Lock, LogOut, User } from 'lucide-react';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AuthCallback from './components/AuthCallback';
import SQLi from './pages/SQLi';
import ReflectedXSS from './pages/ReflectedXSS';
import StoredXSS from './pages/StoredXSS';
import DOMXSS from './pages/DOMXSS';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error.message);
  }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-indigo-700 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <Shield className="w-10 h-10 mr-3" />
                <h1 className="text-3xl font-bold">CyberTest Lab</h1>
              </Link>
              <div className="flex items-center space-x-6">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link to="/auth" className="text-white hover:text-indigo-200 transition-colors">
                    Login/Register
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-sm">Educational Purposes Only</span>
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
              <p className="text-yellow-700">
                This is a controlled environment for learning about web security vulnerabilities.
                Practice responsible testing and never use these techniques on real websites without authorization.
              </p>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
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
              <span>Secure Testing Environment</span>
            </div>
            <p className="text-gray-400 text-sm">
              For educational purposes only. Do not use these techniques on real websites without authorization.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;