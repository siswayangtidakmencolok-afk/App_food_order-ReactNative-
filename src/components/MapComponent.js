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
  interactive = true,
  nearbyOrders = []        // Array dari { latitude, longitude } untuk pesanan fiktif
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
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage({ type: 'update_pos', lat, lng }, '*');
        }, 100);
      } else {
        webViewRef.current?.injectJavaScript(`if(window.updateDriverPos) window.updateDriverPos(${lat}, ${lng}); true;`);
      }
    }
  }, [latitude, longitude]);

  // ── HTML CONTENT (Leaflet + Interaction + Nearby) ──
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
        #map { width:100%; height:100vh; cursor: ${onLocationSelect ? 'pointer' : 'default'}; }
        .leaflet-control-attribution { font-size: 8px !important; }
        .pulse {
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(238, 77, 45, 0.4); border: 2px solid #EE4D2D;
          animation: pulse 1.5s infinite;
        }
        .nearby-pulse {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(76, 175, 80, 0.3); border: 1px solid #4CAF50;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        .leaflet-marker-icon { transition: all 0.3s linear; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${latitude}, ${longitude}], 15);
        L.tileLayer('${tileUrl}').addTo(map);

        var currentMarker;
        var destMarker;
        var routeLine;
        var nearbyMarkers = [];

        function createIcon(isNearby) {
          return L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='" + (isNearby ? "nearby-pulse" : "pulse") + "'></div><div style='background:" + (isNearby ? "#4CAF50" : "#EE4D2D") + ";width:" + (isNearby? "8px":"12px") + ";height:" + (isNearby? "8px":"12px") + ";border-radius:50%;border:2px solid #fff;position:absolute;top:" + (isNearby? "6px":"9px") + ";left:" + (isNearby? "6px":"9px") + ";'></div>",
            iconSize: [30, 30], iconAnchor: [15, 15]
          });
        }

        // Main Marker
        currentMarker = L.marker([${latitude}, ${longitude}], { icon: createIcon(false) }).addTo(map);
        currentMarker.bindPopup("<b>${locationName}</b>").openPopup();

        // Nearby Orders (Fiktif)
        const nearbyData = ${JSON.stringify(nearbyOrders)};
        nearbyData.forEach(pos => {
          L.marker([pos.latitude, pos.longitude], { icon: createIcon(true) }).addTo(map)
            .bindPopup("Pesanan Sekitar Baru!");
        });

        // Click to Pick Location
        map.on('click', function(e) {
          if(${onLocationSelect ? 'true' : 'false'}) {
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            currentMarker.setLatLng([lat, lng]);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'location_pick', latitude: lat, longitude: lng }));
          }
        });

        async function updateRoute(start, end) {
          if (!end) return;
          try {
            const url = "https://api.geoapify.com/v1/routing?waypoints=" + start[0] + "," + start[1] + "|" + end[0] + "," + end[1] + "&mode=drive&apiKey=${GEOAPIFY_KEY}";
            const res = await fetch(url);
            const d = await res.json();
            if (routeLine) map.removeLayer(routeLine);
            if (destMarker) map.removeLayer(destMarker);
            const coords = d.features[0].geometry.coordinates[0].map(c => [c[1], c[0]]);
            routeLine = L.polyline(coords, { color: '#EE4D2D', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(map);
            destMarker = L.marker(end).addTo(map).bindPopup("🏁 Tujuan");
            map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
          } catch(e) {}
        }

        if(${showRoute && destinationLoc ? 'true' : 'false'}) {
          updateRoute([${latitude}, ${longitude}], [${destinationLoc?.latitude || 0}, ${destinationLoc?.longitude || 0}]);
        }

        function updateUIPos(lat, lng) {
          if(currentMarker) currentMarker.setLatLng([lat, lng]);
          if(!${showRoute ? 'true' : 'false'}) map.panTo([lat, lng]);
        }

        window.updateDriverPos = updateUIPos;
        window.addEventListener('message', function(e) {
          if(e.data.type === 'update_pos') updateUIPos(e.data.lat, e.data.lng);
        });
      </script>
    </body>
    </html>
  `, [isDarkMode, showRoute, !!destinationLoc, nearbyOrders.length]); // RELOAD HANYA JIKA THEME/ROUTE BERUBAH

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

