import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapBoxComponent = ({ currentLatitude, currentLongitude, onLocationSelect }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Only initialize the map once
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESSTOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [currentLongitude || 105.85, currentLatitude || 21.02], // Default to Hanoi
      zoom: 13,
    });

    // Add marker
    markerRef.current = new mapboxgl.Marker({ draggable: false })
      .setLngLat([currentLongitude || 105.85, currentLatitude || 21.02])
      .addTo(mapRef.current);

    // Listen to click event
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      onLocationSelect(lat, lng);
    });

    // Cleanup on unmount
    return () => {
      mapRef.current.remove();
    };
  }, []); // Only run once

  // Update marker position if lat/lng props change
  useEffect(() => {
    if (markerRef.current && currentLatitude && currentLongitude) {
      markerRef.current.setLngLat([currentLongitude, currentLatitude]);
      mapRef.current?.setCenter([currentLongitude, currentLatitude]);
    }
  }, [currentLatitude, currentLongitude]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};

export default MapBoxComponent;
