import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle } from 'lucide-react';

const ALLOWED_EMAILS = [
  'mouloudy6565@gmail.com',
  'mouloudy656565@gmail.com',
  'mouloudj.mohamed.04@gmail.com'
];

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Check if email is authorized
    if (!ALLOWED_EMAILS.includes(email)) {
      setError('This email address is not authorized to access this private testing environment.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        // Sign up with username in metadata
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
            },
          },
        });
        if (signUpError) throw signUpError;
        
        // The trigger will automatically create the user record
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">CyberTest Lab</h1>
          <p className="text-gray-600 mt-2">Private Security Testing Environment</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Sign In' : 'Register'}</h2>
          
          {/* Access Restriction Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="font-medium text-red-800">Restricted Access</h3>
                <p className="text-sm text-red-700 mt-1">
                  Only authorized email addresses can access this private testing environment.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Choose a username"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter your authorized email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Disclaimer</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• This is a private security testing laboratory for personal educational use</p>
            <p>• Contains intentional security vulnerabilities for learning purposes</p>
            <p>• Access is restricted to authorized users only</p>
            <p>• Unauthorized access or use is strictly prohibited</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;