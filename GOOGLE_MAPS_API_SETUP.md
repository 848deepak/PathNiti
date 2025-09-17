# How to Get Google Maps API Key

## 🚀 **Step-by-Step Guide**

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project (or Select Existing)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Enter project name: `PathNiti Maps` (or any name you prefer)
4. Click "Create"

### Step 3: Enable Billing
⚠️ **Important**: Google Maps APIs require billing to be enabled, even for free usage.

1. Go to "Billing" in the left menu
2. Click "Link a billing account"
3. Add a payment method (credit/debit card)
4. **Don't worry**: You get $200 free credits per month!

### Step 4: Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Places API** (for nearby search)
   - **Maps JavaScript API** (for map display)
   - **Geocoding API** (for address conversion)

### Step 5: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### Step 6: Configure API Key Restrictions
1. Click on your API key to edit it
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add these referrers:
     - `localhost:3000/*`
     - `localhost:3001/*`
     - `127.0.0.1:3000/*`
     - `127.0.0.1:3001/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Places API, Maps JavaScript API, Geocoding API
4. Click "Save"

### Step 7: Update Your Environment File
1. Open `.env.local` in your project
2. Replace the existing API key:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 8: Restart Your Development Server
```bash
npm run dev
```

## 💰 **Pricing Information**
- **Free Tier**: $200 credit per month
- **Places API**: $32 per 1000 requests
- **Maps JavaScript API**: $7 per 1000 loads
- **Geocoding API**: $5 per 1000 requests

**For development/testing**: You'll likely stay within the free tier!

## 🔧 **Troubleshooting**

### If you get "REQUEST_DENIED":
1. Check if APIs are enabled
2. Verify API key restrictions
3. Ensure billing is enabled
4. Wait 5-10 minutes for changes to propagate

### If you get "OVER_QUERY_LIMIT":
1. Check your usage in Google Cloud Console
2. Verify billing is set up correctly

### Test Your API Key:
```bash
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=30.7236,76.7023&radius=5000&type=university&key=YOUR_API_KEY"
```

## 🎯 **Quick Checklist**
- [ ] Google Cloud project created
- [ ] Billing enabled
- [ ] Places API enabled
- [ ] Maps JavaScript API enabled
- [ ] Geocoding API enabled
- [ ] API key created
- [ ] API key restrictions configured
- [ ] Environment file updated
- [ ] Development server restarted

## 🆘 **Need Help?**
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console Help](https://cloud.google.com/docs)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)

Once you complete these steps, your Google Maps integration will work with real data! 🎉


