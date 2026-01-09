
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import { Link } from 'react-router-dom';
import * as mapHelpers from '../utils/mapHelpers';
import { reverseGeocode } from '../utils/geocode';
import { useBraceletUsers } from '../hooks/useUsers';
import LoadingSpinner from '../components/LoadingSpinner';

/* ---------------------- Component ---------------------- */

function Home() {
  const [center, setCenter] = useState([14.5921, 120.9755]);
  const { braceletUsers, loading } = useBraceletUsers();
  const [addressCache, setAddressCache] = useState({});

  // Effect to re-center the map when an online user's location changes
  useEffect(() => {
    // Find the most recently updated user who is online
    const latestOnlineUser = braceletUsers
      .filter(u => u.online && u.lastSeen)
      .sort((a, b) => b.lastSeen - a.lastSeen)[0];

    if (latestOnlineUser?.position) {
      const [lat, lng] = latestOnlineUser.position;
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter([lat, lng]);
      }
    }
  }, [braceletUsers]);


  // Fetch address for a user if not already cached
  const fetchAddress = async (user) => {
    if (!user?.position || addressCache[user.id]) return;
    const [lat, lng] = user.position;
    if (isNaN(lat) || isNaN(lng)) return;
    setAddressCache((prev) => ({ ...prev, [user.id]: 'Loading address...' }));
    const address = await reverseGeocode(lat, lng);
    setAddressCache((prev) => ({ ...prev, [user.id]: address || 'Address not found' }));
  };
  

  if (loading) return <div className="loading"><LoadingSpinner /></div>;

  const getInitialCenter = () => {
    // First, try to find an online user with SOS
    const sosUser = braceletUsers.find(u => u.sos && u.online);
    if (sosUser?.position) return sosUser.position;

    // Then, try to find any online user
    const onlineUser = braceletUsers.find(u => u.online);
    if (onlineUser?.position) return onlineUser.position;

    // Finally, try to find any user with a valid position
    const anyUser = braceletUsers.find(u => 
      Array.isArray(u.position) && 
      u.position.length === 2 && 
      !isNaN(u.position[0]) && 
      !isNaN(u.position[1])
    );
    if (anyUser) return anyUser.position;

    // Default to TUP Manila if no valid positions found
    return center;
  };


  return (
    <div className="map-page">
      <div className="map-container">
        <MapContainer 
          center={getInitialCenter()} 
          zoom={20} 
          style={{ height: '99%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {braceletUsers.map((person) => {
            // Trigger address fetch on render if not cached
            if (!addressCache[person.id]) fetchAddress(person);
            return (
              person.position && (
              <Marker key={person.id} position={person.position} icon={mapHelpers.createCustomIcon(person)}>
                <Popup className="custom-popup">
                  <Link to={`/userProfile/${person.id}`} state={{ personData: person }} className="popup-content">
                    <img src={person.avatar} alt={person.name} className="popup-image" />
                    <div className="popup-info">
                      <h3>{person.name}</h3>
                      <p>Battery: {person.battery}%</p>
                      <p>Status: {person.online ? '🟢 Online' : '🔴 Offline'}</p>
                      <p>Pulse: {person.pulseRate ?? '—'}</p>
                      <p>Last Seen: {person.lastSeen ? person.lastSeen.toLocaleTimeString() : '—'}</p>
                      <p>Location: {addressCache[person.id] || 'Loading address...'}</p>
                      {person.sos && <p className="sos">🚨 SOS Active!</p>}
                    </div>
                  </Link>
                </Popup>
              </Marker>
              )
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default Home;
