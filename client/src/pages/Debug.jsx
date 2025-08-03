import React from 'react';
import ServerHealthCheck from '../components/ServerHealthCheck';
import { useAuth } from '../context/AuthContext';

const DebugPage = () => {
  const { user, token, isAuthenticated, loading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Debug Dashboard</h1>
          <p className="text-gray-400">Diagnose API and server connection issues</p>
        </div>

        {/* Auth Status */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🔐 Authentication Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-300 mb-1">Authenticated:</div>
              <div className={`font-mono p-2 rounded ${isAuthenticated ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {isAuthenticated ? '✅ Yes' : '❌ No'}
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Loading:</div>
              <div className={`font-mono p-2 rounded ${loading ? 'bg-yellow-900/50 text-yellow-300' : 'bg-gray-700 text-gray-300'}`}>
                {loading ? '⏳ Yes' : '✅ No'}
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Token Exists:</div>
              <div className={`font-mono p-2 rounded ${token ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {token ? '✅ Yes' : '❌ No'}
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">User Data:</div>
              <div className={`font-mono p-2 rounded ${user ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {user ? `✅ Loaded (${user.name})` : '❌ No user data'}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4">
              <div className="text-gray-300 mb-1">Error:</div>
              <div className="bg-red-900/50 text-red-300 p-3 rounded font-mono text-sm">
                {error}
              </div>
            </div>
          )}

          {token && (
            <div className="mt-4">
              <div className="text-gray-300 mb-1">Token (first 50 chars):</div>
              <div className="bg-gray-700 text-gray-300 p-2 rounded font-mono text-xs break-all">
                {token.substring(0, 50)}...
              </div>
            </div>
          )}
        </div>

        {/* Server Health Check */}
        <ServerHealthCheck />

        {/* Environment Info */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🌐 Environment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-300 mb-1">Frontend URL:</div>
              <div className="bg-gray-700 text-gray-300 p-2 rounded font-mono">
                {window.location.origin}
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Expected Backend URL:</div>
              <div className="bg-gray-700 text-gray-300 p-2 rounded font-mono">
                http://localhost:5001
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Axios Base URL:</div>
              <div className="bg-gray-700 text-gray-300 p-2 rounded font-mono">
                {process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}
              </div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Node Environment:</div>
              <div className="bg-gray-700 text-gray-300 p-2 rounded font-mono">
                {process.env.NODE_ENV || 'development'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.open('http://localhost:5001/api/test', '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Test Backend Health
            </button>
            <button
              onClick={() => localStorage.clear()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Clear Local Storage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
