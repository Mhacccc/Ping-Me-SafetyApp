// src/context/BraceletDataProvider.jsx
// Thin context that calls useBraceletData() ONCE and shares the result
// with all child pages. Eliminates duplicate Firestore listeners.
// Also holds a shared addressCache so reverse geocoding only happens once globally.
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useBraceletData, useSosReportGenerator } from '../hooks/useBraceletData';
import { reverseGeocode } from '../utils/geocode';

const BraceletDataContext = createContext(null);

export function BraceletDataProvider({ children }) {
  const data = useBraceletData();

  // Run the SOS report generator once at the layout level
  useSosReportGenerator(data.braceletUsers);

  // ---- Centralized address cache ----
  // Only ONE set of reverse-geocoding requests runs for the entire app.
  const [addressCache, setAddressCache] = useState({});
  // Tracks the EXACT coordinates we last fetched for each user.
  // When Firestore pushes a new position, the rounded key won't match → triggers re-fetch.
  const lastFetchedPos = useRef(new Map());

  useEffect(() => {
    let active = true;

    async function run() {
      for (const u of data.braceletUsers) {
        // If a new update came in, we stop queuing new requests in THIS loop.
        // The new loop will pick up where we left off.
        if (!active) break;
        if (!u?.position) continue;

        const [lat, lng] = u.position;
        if (isNaN(lat) || isNaN(lng)) continue;
        if (lat === 0 && lng === 0) continue;

        // Round to ~11m precision — same key format as geocode.js cache
        const posKey = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;

        // Skip if we already fetched for these exact coordinates
        if (lastFetchedPos.current.get(u.id) === posKey) continue;

        lastFetchedPos.current.set(u.id, posKey);
        setAddressCache((prev) => ({ ...prev, [u.id]: 'Fetching location…' }));

        const addr = await reverseGeocode(lat, lng);

        // FIX: Even if this loop was interrupted (!active), we MUST save the result
        // we just fetched! Otherwise they get permanently stuck on "Fetching...".
        // We only discard the result if the user actually MOVED to new coordinates.
        if (lastFetchedPos.current.get(u.id) === posKey) {
          setAddressCache((prev) => ({
            ...prev,
            [u.id]: addr || 'Address not found',
          }));
        }
      }
    }

    run();
    return () => { active = false; };
  }, [data.braceletUsers]);

  // Allow individual pages (like UserProfile) to request a geocode for a specific position
  const fetchAddress = useCallback(async (userId, lat, lng) => {
    const posKey = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
    if (lastFetchedPos.current.get(userId) === posKey) return;

    lastFetchedPos.current.set(userId, posKey);
    setAddressCache((prev) => ({ ...prev, [userId]: 'Fetching location…' }));
    
    const addr = await reverseGeocode(lat, lng);
    
    // Prevent stale overwrites if called multiple times rapidly
    if (lastFetchedPos.current.get(userId) === posKey) {
      setAddressCache((prev) => ({ ...prev, [userId]: addr || 'Address not found' }));
    }
  }, []);

  const [mapViewState, setMapViewState] = useState(null);

  return (
    <BraceletDataContext.Provider value={{ ...data, addressCache, fetchAddress, mapViewState, setMapViewState }}>
      {children}
    </BraceletDataContext.Provider>
  );
}

export function useBraceletUsers() {
  const ctx = useContext(BraceletDataContext);
  if (!ctx) {
    throw new Error('useBraceletUsers must be used inside BraceletDataProvider');
  }
  return ctx;
}
