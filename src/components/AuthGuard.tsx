import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ALLOWED_EMAILS = [
  'mouloudy6565@gmail.com',
  'mouloudy656565@gmail.com',
  'mouloudj.mohamed.04@gmail.com'
];

function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setIsAuthorized(currentUser ? ALLOWED_EMAILS.includes(currentUser.email || '') : false);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setIsAuthorized(currentUser ? ALLOWED_EMAILS.includes(currentUser.email || '') : false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">CyberTest Lab</h1>
            <p className="text-gray-600 mt-2">Private Security Testing Environment</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="font-medium text-red-800">Access Restricted</h3>
                <p className="text-sm text-red-700 mt-1">
                  This is a private security testing environment. Access is restricted to authorized users only.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Disclaimer</h3>
            <p className="text-sm text-yellow-700">
              This application contains intentional security vulnerabilities for educational purposes. 
              It is designed for personal use by the owner only. Unauthorized access or use is prohibited.
            </p>
          </div>

          <a
            href="/auth"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center block font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800">Access Denied</h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-800 mb-2">Unauthorized Email</h3>
            <p className="text-sm text-red-700">
              Your email address ({user.email}) is not authorized to access this private testing environment.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-2">About This Application</h3>
            <p className="text-sm text-gray-700">
              This is a private security testing laboratory designed for personal educational use. 
              The application contains intentional vulnerabilities and is not intended for public access.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* User info and logout button */}
      <div className="bg-indigo-800 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.email}</span>
            <span className="text-indigo-200">|</span>
            <span className="text-indigo-200">Private Testing Environment</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-indigo-200 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default AuthGuard;