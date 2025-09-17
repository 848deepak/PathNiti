# Google Maps API Fix Guide

## Current Issue
The Google Maps API is returning `REQUEST_DENIED` error, which means:
- API key is invalid or not configured
- Required APIs are not enabled
- API key restrictions are blocking the request

## Quick Fix Steps

### 1. Check Your API Key
Make sure your `.env.local` file has a valid API key:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 2. Enable Required APIs
Go to [Google Cloud Console](https://console.cloud.google.com/) and enable:
- **Places API** (for nearby search)
- **Maps JavaScript API** (for map display)
- **Geocoding API** (for address conversion)

### 3. Check API Key Restrictions
In Google Cloud Console:
1. Go to "Credentials" → Your API Key
2. Check "Application restrictions":
   - If set to "HTTP referrers", add `localhost:3001/*`
   - If set to "IP addresses", add your local IP
   - Or temporarily set to "None" for testing

### 4. Check Billing
- Ensure billing is enabled on your Google Cloud project
- Google Maps APIs require billing even for free tier usage

### 5. Test the API Key
Test your API key directly:
```bash
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=28.6139,77.2090&radius=5000&type=university&key=YOUR_API_KEY"
```

## Current Status
✅ **Fallback Data Working**: The feature now shows sample colleges when API key is not working
✅ **Error Handling**: Clear error messages explain the issue
✅ **User Experience**: Feature doesn't break completely

## What You'll See
- **With Working API Key**: Real Google Maps data
- **With Invalid API Key**: Sample colleges + warning message
- **Error Message**: "API Configuration Issue" with specific details

## Next Steps
1. Fix your Google Maps API key configuration
2. Restart the development server: `npm run dev`
3. Test the feature at `/colleges?tab=nearby`

The feature is now robust and won't break even with API issues! 🎉

