# Google Maps Nearby Colleges Feature Setup

## Overview
This feature allows users to find nearby colleges using Google Maps Places API. It includes:
- Location detection (GPS or manual address input)
- Real-time college search using Google Maps API
- Interactive map with markers
- College details with ratings and photos
- Pagination support for large result sets

## Setup Instructions

### 1. Google Maps API Key Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Environment Configuration
Add your Google Maps API key to your environment file:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Quotas and Billing
- Google Maps Places API has usage quotas
- Set up billing to avoid service interruptions
- Monitor usage in Google Cloud Console
- Consider implementing caching for production use

## Features Implemented

### 1. Location Services (`src/lib/location.ts`)
- **getCurrentLocation()**: Uses browser Geolocation API
- **getLocationFromAddress()**: Geocodes addresses to coordinates
- **getAddressFromLocation()**: Reverse geocoding
- **calculateDistance()**: Distance calculations between points
- Error handling for location permissions and network issues

### 2. API Route (`src/app/api/colleges/nearby/route.ts`)
- **GET /api/colleges/nearby**: Fetches nearby colleges from Google Maps
- Parameters: `lat`, `lng`, `radius`, `page_token`
- Returns: College data with ratings, photos, and place details
- Handles API errors and quota limits

### 3. Google Maps Component (`src/components/CollegeMap.tsx`)
- Interactive map with custom markers
- Info windows with college details
- Photo display from Google Places
- Responsive design
- Error handling for API key issues

### 4. Nearby Colleges Component (`src/components/NearbyColleges.tsx`)
- Location detection with fallback to manual input
- Real-time college search
- Map and list view
- Pagination support
- Loading states and error handling

### 5. Updated Colleges Page (`src/app/colleges/page.tsx`)
- Tab navigation between directory and nearby search
- Integrated nearby colleges feature
- Maintains existing directory functionality

## Usage

### For Users
1. Navigate to `/colleges`
2. Click on "Find Nearby Colleges" tab
3. Allow location access or enter address manually
4. View results on map and in list format
5. Click markers or list items for details
6. Use "Load More" for additional results

### For Developers
```typescript
// Fetch nearby colleges
const response = await fetch('/api/colleges/nearby?lat=28.6139&lng=77.2090&radius=5000')
const data = await response.json()

// Use location service
const location = await LocationService.getCurrentLocation()
const address = await LocationService.getLocationFromAddress('Delhi, India')
```

## API Response Format
```typescript
interface College {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number
  user_ratings_total: number
  place_id: string
  types: string[]
  business_status?: string
  price_level?: number
  photos: Array<{
    photo_reference: string
    height: number
    width: number
  }>
}
```

## Error Handling
- Location permission denied
- Network connectivity issues
- Google Maps API quota exceeded
- Invalid addresses
- API key configuration errors

## Performance Considerations
- Implement caching for frequently searched locations
- Use pagination to limit initial load
- Optimize image loading for college photos
- Consider implementing search debouncing

## Security Notes
- API key is exposed to client (required for Google Maps)
- Restrict API key to specific domains
- Monitor usage to prevent abuse
- Consider server-side proxy for sensitive applications

## Future Enhancements
- Save favorite colleges
- Filter by college type or rating
- Distance-based sorting
- Integration with college database
- Offline map support
- Advanced search filters


