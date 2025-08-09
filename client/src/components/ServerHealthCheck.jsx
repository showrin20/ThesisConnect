import React, { useState } from 'react';
import { testServerConnection, testApiEndpoints } from '../utils/serverHealth';

const ServerHealthCheck = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const serverTest = await testServerConnection();
      const endpointTests = await testApiEndpoints();
      
      setResults({
        server: serverTest,
        endpoints: endpointTests,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">🔧 Server Health Check</h2>
      
      <button
        onClick={runHealthCheck}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Health Check'}
      </button>

      {results && (
        <div className="space-y-4">
          <div className="text-xs text-gray-400">
            Last check: {new Date(results.timestamp).toLocaleString()}
          </div>
          
          {/* Server Connection */}
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-semibold text-white mb-2">Server Connection</h3>
            <div className={`p-2 rounded text-sm ${
              results.server.success 
                ? 'bg-green-900/50 text-green-300' 
                : 'bg-red-900/50 text-red-300'
            }`}>
              {results.server.success ? '✅ Connected' : '❌ Failed'}
              {results.server.error && <div>Error: {results.server.error}</div>}
              {results.server.data && <div>Response: {JSON.stringify(results.server.data)}</div>}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-semibold text-white mb-2">API Endpoints</h3>
            {Object.entries(results.endpoints).map(([endpoint, result]) => (
              <div key={endpoint} className="mb-2">
                <div className="font-medium text-gray-300">/api/{endpoint}</div>
                <div className={`p-2 rounded text-sm ${
                  result.success 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  {result.success ? '✅ Working' : '❌ Failed'}
                  {result.error && <div>Error: {result.error}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-semibold text-white mb-2">🛠️ Troubleshooting Tips</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>• Make sure the backend server is running: <code className="bg-slate-600 px-1 rounded">npm run dev</code> in the server folder</div>
              <div>• Check if the server is running on port 1085: <a href="http://localhost:1085/api/test" target="_blank" className="text-blue-400 hover:underline">http://localhost:1085/api/test</a></div>
              <div>• Verify CORS settings allow requests from http://localhost:5173</div>
              <div>• Check browser network tab for detailed error messages</div>
              <div>• For auth endpoints, make sure you're logged in with a valid token</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerHealthCheck;
