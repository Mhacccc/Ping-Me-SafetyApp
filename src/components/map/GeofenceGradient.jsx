import React from 'react';

/**
 * GeofenceGradient Component
 * 
 * Injects an SVG <defs> block into the DOM containing a radial gradient definition.
 * Leaflet path options can then reference this gradient using `fill: 'url(#geofenceGradient)'`.
 * 
 * Gradient stops (based on user's design):
 * - 0%: #FFFFFF (0% opacity)
 * - 50%: #FFDA44 (25% opacity)
 * - 100%: #FF6600 (30% opacity)
 */
const GeofenceGradient = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <radialGradient id="geofenceGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFDA44" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF6600" stopOpacity="0.30" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default GeofenceGradient;
