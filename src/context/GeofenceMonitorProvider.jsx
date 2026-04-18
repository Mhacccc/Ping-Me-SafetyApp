// src/context/GeofenceMonitorProvider.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useBraceletUsers } from './BraceletDataProvider';
import { useAuth } from './AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import * as geofenceUtils from '../utils/geofenceUtils';
import * as notificationService from '../services/notificationService';

const GeofenceMonitorContext = createContext(null);

/**
 * EXIT_COOLDOWN_MS — How long (in ms) the user must remain outside a geofence
 * before an exit notification is fired. This prevents GPS jitter on the boundary
 * from spamming "entered/left" notification pairs.
 * 
 * 10 seconds is a conservative default:
 *   - GPS signals update every ~5s from the bracelet
 *   - A genuine departure means 6+ consecutive "outside" readings
 *   - A boundary bounce typically resolves within 1-2 GPS ticks (5-10s)
 */
const EXIT_COOLDOWN_MS = 10_000;

export function GeofenceMonitorProvider({ children }) {
    const { braceletUsers } = useBraceletUsers();
    const { currentUser } = useAuth();

    const [geofences, setGeofences] = useState([]);
    const [geofencesLoaded, setGeofencesLoaded] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState([]);

    // Use a ref to persist the alerted set across renders without triggering them
    const alertedUsersRef = useRef(new Set());
    // Ref to avoid firing alerts on the very first evaluation
    const isFirstRun = useRef(true);

    // Map of pending exit timers — key: "userId-zoneId", value: timeoutId
    // Used to debounce exit notifications so GPS jitter doesn't cause spam
    const exitTimersRef = useRef(new Map());

    // 1. Fetch Geofences
    useEffect(() => {
        if (!currentUser) {
            setGeofences([]);
            setGeofencesLoaded(false);
            return;
        }

        const q = query(
            collection(db, "geofences"),
            where("appUserId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedZones = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    appUserName: currentUser.displayName,
                    id: doc.id,
                    name: data.name,
                    radius: data.radius,
                    latlngs: data.coordinates,
                    type: data.type,
                };
            });
            setGeofences(fetchedZones);
            setGeofencesLoaded(true);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 2. Process Transitions
    useEffect(() => {
        // Guard: Don't process until both users and geofences are loaded
        if (!currentUser || !geofencesLoaded || !braceletUsers) return;

        const { currentAlerts, newlyDetected, newlyExited, usersToUpdateOffline } =
            geofenceUtils.checkGeofenceTransitions(
                braceletUsers,
                geofences,
                alertedUsersRef.current
            );

        setActiveAlerts(currentAlerts);

        // Update statuses for users who left their zones
        usersToUpdateOffline.forEach(status => {
            updateDoc(doc(db, 'deviceStatus', status.id), { currentGeofenceId: null })
                .catch(e => console.error("Error clearing geofence status", e));
        });

        // If it's the very first time we run this logic after loading, 
        // we skip notifications to avoid alerting for people who were already in the zone.
        // The checking logic above will have added them to alertedUsersRef and updated the DB if needed.
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        // ── Handle ENTRY notifications (fire immediately) ──
        newlyDetected.forEach(det => {
            // If the user just re-entered a zone, cancel any pending exit timer
            // for this user+zone — it was GPS jitter, not a real departure
            const exitTimerKey = `${det.user.id}-${det.zone.id}`;
            if (exitTimersRef.current.has(exitTimerKey)) {
                clearTimeout(exitTimersRef.current.get(exitTimerKey));
                exitTimersRef.current.delete(exitTimerKey);
            }

            notificationService.saveGeofenceNotification(currentUser, det).catch(err =>
                console.error("Error saving geofence entry notification:", err)
            );
        });

        // ── Handle EXIT notifications (debounced with EXIT_COOLDOWN_MS) ──
        // We wait before firing the notification to confirm it's a genuine departure.
        // If the user bounces back inside within the cooldown, the timer is cancelled above.
        newlyExited.forEach(det => {
            const exitTimerKey = `${det.user.id}-${det.zone.id}`;

            // Don't start a duplicate timer if one is already running
            if (exitTimersRef.current.has(exitTimerKey)) return;

            const timerId = setTimeout(() => {
                exitTimersRef.current.delete(exitTimerKey);

                notificationService.saveGeofenceNotification(currentUser, det).catch(err =>
                    console.error("Error saving geofence exit notification:", err)
                );
            }, EXIT_COOLDOWN_MS);

            exitTimersRef.current.set(exitTimerKey, timerId);
        });

    }, [braceletUsers, geofences, geofencesLoaded, currentUser]);

    // 3. Cleanup all pending exit timers on unmount
    useEffect(() => {
        return () => {
            exitTimersRef.current.forEach(timerId => clearTimeout(timerId));
            exitTimersRef.current.clear();
        };
    }, []);

    return (
        <GeofenceMonitorContext.Provider value={{ geofences, activeAlerts, geofencesLoaded }}>
            {children}
        </GeofenceMonitorContext.Provider>
    );
}

export function useGeofenceMonitor() {
    const ctx = useContext(GeofenceMonitorContext);
    if (!ctx) throw new Error('useGeofenceMonitor must be used inside GeofenceMonitorProvider');
    return ctx;
}
