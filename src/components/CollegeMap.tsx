"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { Card, CardContent } from "@/components/ui";
import { Star, MapPin, Users, ExternalLink } from "lucide-react";

interface College {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  user_ratings_total: number;
  place_id: string;
  types: string[];
  business_status?: string;
  price_level?: number;
  photos: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface CollegeMapProps {
  colleges: College[];
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  height?: string;
  showInfoWindows?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 28.6139, // Delhi coordinates as default
  lng: 77.209,
};

const defaultZoom = 13;

export default function CollegeMap({
  colleges,
  center,
  zoom = defaultZoom,
  height = "500px",
  showInfoWindows = true,
}: CollegeMapProps) {
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
    id: "google-map-script",
  });

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (colleges.length > 0) {
      return {
        lat: colleges[0].lat,
        lng: colleges[0].lng,
      };
    }
    return defaultCenter;
  }, [center, colleges]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);

      // Fit bounds to show all colleges
      if (colleges.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        colleges.forEach((college) => {
          bounds.extend(new google.maps.LatLng(college.lat, college.lng));
        });
        map.fitBounds(bounds);
      }
    },
    [colleges],
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = useCallback((college: College) => {
    setSelectedCollege(college);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedCollege(null);
  }, []);

  const getGoogleMapsUrl = (placeId: string) => {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  };

  const getPhotoUrl = (photoReference: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <p>
              Error loading Google Maps. Please check your API key
              configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (colleges.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <p>No colleges found to display on the map.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {colleges.map((college) => (
          <Marker
            key={college.id}
            position={{ lat: college.lat, lng: college.lng }}
            title={college.name}
            onClick={() => handleMarkerClick(college)}
            icon={{
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                  <path d="M16 8l-4 8h8l-4-8z" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
          />
        ))}

        {showInfoWindows && selectedCollege && (
          <InfoWindow
            position={{ lat: selectedCollege.lat, lng: selectedCollege.lng }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-xs">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {selectedCollege.name}
                </h3>

                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{selectedCollege.address}</span>
                </div>

                {selectedCollege.rating > 0 && (
                  <div className="flex items-center text-xs">
                    <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">
                      {selectedCollege.rating.toFixed(1)}
                    </span>
                    {selectedCollege.user_ratings_total > 0 && (
                      <span className="text-gray-500 ml-1">
                        ({selectedCollege.user_ratings_total} reviews)
                      </span>
                    )}
                  </div>
                )}

                {selectedCollege.photos.length > 0 && (
                  <div className="mt-2">
                    <Image
                      src={getPhotoUrl(
                        selectedCollege.photos[0].photo_reference,
                      )}
                      alt={selectedCollege.name}
                      width={300}
                      height={80}
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    <span>University</span>
                  </div>

                  <a
                    href={getGoogleMapsUrl(selectedCollege.place_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Maps
                  </a>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
