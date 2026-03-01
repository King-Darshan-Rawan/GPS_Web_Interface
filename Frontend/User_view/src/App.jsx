import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const API = "https://gps-web-interface.onrender.com";
  const [simNumber, setSimNumber] = useState("");

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm"
          }
        ]
      },
      center: [75.8577, 22.7196],
      zoom: 13
    });
  }, []);

  // Fetch history
  const fetchHistory = async (simNumber) => {
  if (!simNumber) {
    alert("Enter SIM number");
    return [];
  }

  try {
    const res = await fetch(`${API}/api/location/history/${simNumber}`);
    const data = await res.json();
    console.log("Fetched:", data);
    return data;
  } catch (err) {
    console.error("Error fetching history:", err);
    return [];
  }
};

  // Draw route
  const drawRoute = (data) => {
  if (!map.current || data.length === 0) return;

  const coordinates = data.map(
    loc => loc.coordinates.coordinates
  );

  // Remove old layers if exist
  ["route", "points"].forEach(layer => {
    if (map.current.getLayer(layer)) map.current.removeLayer(layer);
  });

  ["route", "points"].forEach(source => {
    if (map.current.getSource(source)) map.current.removeSource(source);
  });

  // ========= SKY BLUE LINE =========
  map.current.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates
      }
    }
  });

  map.current.addLayer({
    id: "route",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#38bdf8", // sky blue
      "line-width": 4
    }
  });

  // ========= NAVY BLUE DOTS =========
  map.current.addSource("points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: coordinates.map(coord => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coord
        }
      }))
    }
  });

  map.current.addLayer({
    id: "points",
    type: "circle",
    source: "points",
    paint: {
      "circle-radius": 4,
      "circle-color": "#0a1f44", // navy blue
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff"
    }
  });

  // ========= LATEST PIN =========
  const lastCoord = coordinates[coordinates.length - 1];

  // Remove old marker if exists
  if (window.latestMarker) {
    window.latestMarker.remove();
  }

  window.latestMarker = new maplibregl.Marker({
    color: "#ff0000"
  })
    .setLngLat(lastCoord)
    .addTo(map.current);

  // Zoom to latest
  map.current.flyTo({
    center: lastCoord,
    zoom: 15
  });
};

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow-md p-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-center">

        <h2 className="text-lg font-semibold text-center sm:mr-4">
          GPS Admin Panel
        </h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Enter SIM Number"
            value={simNumber}
            onChange={(e) => setSimNumber(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-64"
          />

          <button
  onClick={async () => {
    const data = await fetchHistory(simNumber);
    drawRoute(data);
  }}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  Show
</button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <div
          ref={mapContainer}
          className="w-full h-full"
        />
      </div>

    </div>
  );
}

export default App;