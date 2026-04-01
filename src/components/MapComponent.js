// src/components/MapComponent.js
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GEOAPIFY_KEY, MAP_TILE_URL, MAP_ATTRIBUTION } from '../config/maps';

const MapComponent = React.memo(({ 
  latitude, 
  longitude, 
  height = 200, 
  isDarkMode = false, 
  locationName = 'Lokasi',
  onLocationSelect = null, // Callback saat peta diklik
  destinationLoc = null,    // { latitude, longitude } untuk routing
  showRoute = false,
  interactive = true
}) => {
  
  const webViewRef = useRef(null);
  const iframeRef  = useRef(null);
  const initialPos = useRef({ latitude, longitude }); // SIMPAN POSISI AWAL
  const tileUrl = MAP_TILE_URL(isDarkMode);
  const bgColor = isDarkMode ? '#1a1a1a' : '#f0f0f0';

  // ── UPDATE LIVE POS VIA MESSAGE (PREVENT REBOOT) ──
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (Platform.OS === 'web') {
        // Gunakan timeout kecil agar iframe sempat load sempurna
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage({ type: 'update_pos', lat, lng }, '*');
        }, 100);
      } else {
        webViewRef.current?.injectJavaScript(`window.updateDriverPos(${lat}, ${lng}); true;`);
      }
    }
  }, [latitude, longitude]);

  // ── HTML CONTENT (Leaflet + Routing) ──
  // GUNAKAN useMemo AGAR TIDAK RE-RENDER SAAT LAT/LNG BERUBAH
  const mapHTML = React.useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:${bgColor}; overflow: hidden; }
        #map { width:100%; height:100vh; cursor: crosshair; }
        .leaflet-control-attribution { font-size: 8px !important; }
        .pulse {
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(238, 77, 45, 0.4); border: 2px solid #EE4D2D;
          animation: pulse 1.5s infinite;
        }
        /* Smooth Transition for Marker */
        .leaflet-marker-icon {
          transition: all 0.3s linear;
        }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${initialPos.current.latitude}, ${initialPos.current.longitude}], 15);
        L.tileLayer('${tileUrl}', { attribution: '${MAP_ATTRIBUTION}', maxZoom: 19 }).addTo(map);

        var currentMarker;
        var destMarker;
        var routeLine;

        // Custom Icon
        function createPulseIcon() {
          return L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='pulse'></div><div style='background:#EE4D2D;width:12px;height:12px;border-radius:50%;border:2px solid #fff;position:absolute;top:9px;left:9px;'></div>",
            iconSize: [30, 30], iconAnchor: [15, 15]
          });
        }

        // Initialize Marker at Initial Pos
        currentMarker = L.marker([${initialPos.current.latitude}, ${initialPos.current.longitude}], { icon: createPulseIcon() }).addTo(map);
        currentMarker.bindPopup("<b>📍 ${locationName}</b>").openPopup();

        // ... (Route Logic)
        async function updateRoute(start, end) {
          if (!end) return;
          try {
            const url = "https://api.geoapify.com/v1/routing?waypoints=" + start[0] + "," + start[1] + "|" + end[0] + "," + end[1] + "&mode=drive&apiKey=${GEOAPIFY_KEY}";
            const response = await fetch(url);
            const data = await response.json();
            
            if (routeLine) map.removeLayer(routeLine);
            if (destMarker) map.removeLayer(destMarker);

            const coordinates = data.features[0].geometry.coordinates[0].map(c => [c[1], c[0]]);
            routeLine = L.polyline(coordinates, { color: '#EE4D2D', weight: 5, opacity: 0.7, dashArray: '10, 10' }).addTo(map);
            
            destMarker = L.marker(end).addTo(map).bindPopup("<b>🏁 Tujuan</b>");
            map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
          } catch(e) { console.error(e); }
        }

        if(${showRoute && destinationLoc ? 'true' : 'false'}) {
          updateRoute([${initialPos.current.latitude}, ${initialPos.current.longitude}], [${destinationLoc?.latitude || 0}, ${destinationLoc?.longitude || 0}]);
        }

        // Handle update dari props (via injectJS / Message)
        function updateUIPos(lat, lng) {
          if(currentMarker) currentMarker.setLatLng([lat, lng]);
        }

        window.updateDriverPos = updateUIPos;
        
        window.addEventListener('message', function(event) {
          if(event.data.type === 'update_pos') {
            updateUIPos(event.data.lat, event.data.lng);
          }
        });
      </script>
    </body>
    </html>
  `, [isDarkMode, showRoute, !!destinationLoc]); // RELOAD HANYA JIKA THEME/ROUTE BERUBAH

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location_pick' && onLocationSelect) {
        onLocationSelect(data.latitude, data.longitude);
      }
    } catch (e) {}
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          ref={iframeRef}
          srcDoc={mapHTML}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
          title="Peta Lokasi"
        />
      </View>
    );
  }

  // ── MOBILE: WebView ──
  const { WebView } = require('react-native-webview');
  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%', borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#eee', position: 'relative'
  }
});

export default MapComponent;

