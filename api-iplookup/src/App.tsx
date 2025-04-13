import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function App() {
  const [ip, setIp] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

  const isValidIp = (ip: string) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);

  const handleLookup = async (targetIp = ip) => {
    if (targetIp && !isValidIp(targetIp)) {
      setError('Please enter a valid IP address.');
      setData(null);
      return;
    }

    try {
      setError('');
      setData(null);
      setLoading(true);
      //the API
      const response = await axios.get(`https://ipwho.is/${targetIp || ''}`);
      if (response.data.success) {
        setData(response.data);
        saveRecent(response.data);
      } else {
        setError('Invalid IP or lookup failed.');
      }
    } catch (err) {
      setError('Error fetching IP data.');
    } finally {
      setLoading(false);
    }
  };
  sfasf
  useEffect(() => {
    handleLookup('');
    loadRecent();
  }, []);

  const saveRecent = (entry: any) => {
    const stored = JSON.parse(localStorage.getItem('recentLookups') || '[]');
    const filtered = stored.filter((item: any) => item.ip !== entry.ip);
    const updated = [entry, ...filtered].slice(0, 5);
    localStorage.setItem('recentLookups', JSON.stringify(updated));
    setRecent(updated);
  };

  const loadRecent = () => {
    const stored = JSON.parse(localStorage.getItem('recentLookups') || '[]');
    setRecent(stored);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">IP Lookup Tool</h1>

        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IP address"
          className="w-full p-3 border border-gray-300 rounded-xl shadow-sm mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />

        <button
          onClick={() => handleLookup()}
          className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg py-3 px-6 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300"
        >
          🔍 Lookup IP
        </button>

        {error && <p className="text-red-500 mt-4 transition-opacity duration-300">{error}</p>}
        {loading && <p className="mt-4 text-blue-500">Looking up IP...</p>}

        {data && (
          <>
            <div className="mt-6 text-sm w-full bg-blue-50 p-4 rounded-lg shadow-inner transition-all duration-500 text-center space-y-1 animate-fade-in">
              <p><strong>IP:</strong> {data.ip}</p>
              <p>
                <strong>Country:</strong>{' '}
                <span className="inline-flex items-center justify-center gap-2">
                  <img
                    src={`https://flagcdn.com/24x18/${data.country_code?.toLowerCase()}.png`}
                    alt={data.country}
                    className="inline-block mr-1 rounded-sm"
                  />
                  {data.country}
                </span>
              </p>
              <p><strong>City:</strong> {data.city}</p>
              <p><strong>Region:</strong> {data.region}</p>
              <p><strong>Latitude:</strong> {data.latitude}</p>
              <p><strong>Longitude:</strong> {data.longitude}</p>
              <p><strong>ISP:</strong> {data.connection?.isp || 'Unknown'}</p>
              <p><strong>Timezone:</strong> {data.timezone?.id || 'N/A'}</p>
            </div>

            <div className="mt-4 w-full h-64 rounded-lg overflow-hidden shadow-md">
              <MapContainer
                center={[data.latitude, data.longitude]}
                zoom={10}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[data.latitude, data.longitude]}>
                  <Popup>
                    {data.city}, {data.country}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </>
        )}

        {recent.length > 0 && (
          <div className="mt-8 w-full text-left">
            <h2 className="text-blue-600 font-semibold mb-2 text-lg text-center">Recent Lookups</h2>
            <ul className="space-y-2">
              {recent.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setIp(item.ip);
                    handleLookup(item.ip);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer p-2 rounded-lg transition-all text-center"
                >
                  {item.ip} — {item.country}, {item.city}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
