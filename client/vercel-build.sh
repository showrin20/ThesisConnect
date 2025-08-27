#!/bin/bash

# Log the NODE_ENV to help with debugging
echo "NODE_ENV is: $NODE_ENV"

# Ensure proper API URL is set for production
if [ "$NODE_ENV" = "production" ]; then
  echo "Setting production environment variables"
  export VITE_API_URL=https://thesisconnect-backend.onrender.com/api
  echo "VITE_API_URL is set to: $VITE_API_URL"
fi

# Build the React application
npm run build

# Output a message indicating successful build
echo "Build completed successfully!"
