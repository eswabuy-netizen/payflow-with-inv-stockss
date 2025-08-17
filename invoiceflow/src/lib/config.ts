// Configuration for API endpoints
export const API_CONFIG = {
  // In development, use the Vite proxy
  // In production, use the deployed backend URL (set VITE_API_BASE_URL in your Netlify/Render environment)
  baseURL: import.meta.env.PROD 
    ? import.meta.env.VITE_API_BASE_URL || 'https://invoicees.onrender.com' // <-- CHANGE THIS to your deployed backend URL
    : '', // Empty string means use relative URLs (proxy)
};

// Debug logging for deployment
if (import.meta.env.PROD) {
  console.log('🚀 Production mode detected');
  console.log('📡 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('🔗 Final baseURL:', API_CONFIG.baseURL);
  
  // Check if environment variable is missing
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn('⚠️  WARNING: VITE_API_BASE_URL environment variable is not set!');
    console.warn('   Please set this in your Netlify environment variables.');
    console.warn('   Current fallback URL:', API_CONFIG.baseURL);
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  if (API_CONFIG.baseURL) {
    const fullUrl = `${API_CONFIG.baseURL}${endpoint}`;
    console.log(`🌐 API Call: ${fullUrl}`);
    return fullUrl;
  }
  console.log(`🌐 API Call (proxy): ${endpoint}`);
  return endpoint; // Use relative URL for proxy
};
